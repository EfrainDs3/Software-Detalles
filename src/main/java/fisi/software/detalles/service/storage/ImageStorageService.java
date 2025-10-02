package fisi.software.detalles.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ImageStorageService {

    private final Path storageDirectory;
    private final String publicPathPrefix;

    public ImageStorageService(
            @Value("${catalogo.modelos.storage-path:src/main/resources/static/img/upload/modelos}") String storagePath,
            @Value("${catalogo.modelos.public-path:/img/upload/modelos}") String publicPathPrefix) {
        this.storageDirectory = Paths.get(storagePath).toAbsolutePath().normalize();
        this.publicPathPrefix = normalizePublicPrefix(publicPathPrefix);
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar el directorio de almacenamiento para imágenes", e);
        }
    }

    private static final Pattern NON_LATIN = Pattern.compile("[^a-z0-9]+");
    private static final Pattern TRIM_DASH = Pattern.compile("(^-+)|(-+$)");

    public String handleNewImage(String input, String marcaNombre, String modeloNombre) {
        if (!StringUtils.hasText(input)) {
            return null;
        }
        return processInput(input.trim(), null, marcaNombre, modeloNombre);
    }

    public String handleExistingImage(String input, String currentPath, String marcaNombre, String modeloNombre) {
        if (!StringUtils.hasText(input)) {
            return currentPath;
        }
        return processInput(input.trim(), currentPath, marcaNombre, modeloNombre);
    }

    public void deleteImage(String publicPath) {
        deleteIfStored(publicPath);
    }

    private String processInput(String input, String currentPath, String marcaNombre, String modeloNombre) {
        if (input.startsWith("data:")) {
            deleteIfStored(currentPath);
            return storeDataUrl(input, marcaNombre, modeloNombre);
        }
        return normalizePublicPath(input);
    }

    private String storeDataUrl(String dataUrl, String marcaNombre, String modeloNombre) {
        int commaIndex = dataUrl.indexOf(',');
        if (commaIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagen no válido");
        }
        String headerSection = dataUrl.substring(5, commaIndex); // omite "data:"
        if (!headerSection.contains("base64")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La imagen debe estar codificada en base64");
        }
        String mimeType = headerSection.split(";")[0];
        if (!mimeType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten imágenes");
        }
        String base64Data = dataUrl.substring(commaIndex + 1);
        byte[] decodedBytes;
        try {
            decodedBytes = Base64.getDecoder().decode(base64Data);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La imagen proporcionada no es válida");
        }
        String extension = resolveExtension(mimeType);
        String fileName = buildUniqueFileName(marcaNombre, modeloNombre, extension);
        Path target = storageDirectory.resolve(fileName).normalize();
        try {
            Files.write(target, decodedBytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la imagen", e);
        }
        return publicPathPrefix + "/" + fileName;
    }

    private String buildUniqueFileName(String marcaNombre, String modeloNombre, String extension) {
        String marcaSlug = slugify(marcaNombre);
        String modeloSlug = slugify(modeloNombre);
        String baseName = (StringUtils.hasText(marcaSlug) || StringUtils.hasText(modeloSlug))
                ? (marcaSlug + (StringUtils.hasText(marcaSlug) && StringUtils.hasText(modeloSlug) ? "-" : "") + modeloSlug)
                : "";
        baseName = baseName.replaceAll("--+", "-");
        baseName = TRIM_DASH.matcher(baseName).replaceAll("");
        if (!StringUtils.hasText(baseName)) {
            baseName = UUID.randomUUID().toString().replace("-", "");
        }

        String candidate = baseName + "." + extension;
        Path candidatePath = storageDirectory.resolve(candidate).normalize();
        int index = 1;
        while (Files.exists(candidatePath)) {
            candidate = baseName + "-" + index + "." + extension;
            candidatePath = storageDirectory.resolve(candidate).normalize();
            index++;
        }
        return candidate;
    }

    private String slugify(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = normalized.toLowerCase();
        String slug = NON_LATIN.matcher(lower).replaceAll("-");
        return TRIM_DASH.matcher(slug.replaceAll("--+", "-")).replaceAll("");
    }

    private String resolveExtension(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            case "image/svg+xml" -> "svg";
            case "image/png" -> "png";
            default -> "png";
        };
    }

    private void deleteIfStored(String publicPath) {
        if (!StringUtils.hasText(publicPath)) {
            return;
        }
        String normalized = normalizePublicPath(publicPath.trim());
        if (!normalized.startsWith(publicPathPrefix)) {
            return;
        }
        String relative = normalized.substring(publicPathPrefix.length());
        if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        if (!StringUtils.hasText(relative)) {
            return;
        }
        Path target = storageDirectory.resolve(relative).normalize();
        if (!target.startsWith(storageDirectory)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
        }
    }

    private String normalizePublicPath(String value) {
        String trimmed = value.trim();
        if (trimmed.startsWith("data:")) {
            return trimmed;
        }
        try {
            URI uri = URI.create(trimmed);
            if (uri.getScheme() != null) {
                trimmed = uri.getPath();
            }
        } catch (IllegalArgumentException ignored) {
        }
        if (!trimmed.startsWith("/")) {
            trimmed = "/" + trimmed;
        }
        return trimmed.replace("//", "/");
    }

    private String normalizePublicPrefix(String prefix) {
        String trimmed = prefix.trim();
        if (!trimmed.startsWith("/")) {
            trimmed = "/" + trimmed;
        }
        if (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed.replace("//", "/");
    }
}
