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
public class ProductoImageStorageService {

    private final Path storageDirectory;
    private final String publicPathPrefix;

    private static final Pattern NON_LATIN = Pattern.compile("[^a-z0-9]+");
    private static final Pattern TRIM_DASH = Pattern.compile("(^-+)|(-+$)");

    public ProductoImageStorageService(
            @Value("${producto.imagenes.storage-path:src/main/resources/static/img/upload/productos}") String storagePath,
            @Value("${producto.imagenes.public-path:/img/upload/productos}") String publicPathPrefix
    ) {
        this.storageDirectory = Paths.get(storagePath).toAbsolutePath().normalize();
        this.publicPathPrefix = normalizePublicPrefix(publicPathPrefix);
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar el directorio de almacenamiento para imágenes de productos", e);
        }
    }

    public String handleImage(String input, String categoriaCarpeta, String currentPath, String productoNombre) {
        if (!StringUtils.hasText(input)) {
            return currentPath;
        }
        return processInput(input.trim(), categoriaCarpeta, currentPath, productoNombre);
    }

    private String processInput(String input, String categoriaCarpeta, String currentPath, String productoNombre) {
        String sanitizedCategoria = sanitizeCategoria(categoriaCarpeta);
        if (input.startsWith("data:")) {
            deleteIfStored(currentPath);
            return storeDataUrl(input, sanitizedCategoria, productoNombre);
        }
        return normalizePublicPath(input);
    }

    private String storeDataUrl(String dataUrl, String categoriaCarpeta, String productoNombre) {
        int commaIndex = dataUrl.indexOf(',');
        if (commaIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagen no válido");
        }
        String headerSection = dataUrl.substring(5, commaIndex);
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

        Path targetDirectory = ensureCategoriaDirectory(categoriaCarpeta);
        String extension = resolveExtension(mimeType);
        String fileName = buildUniqueFileName(productoNombre, extension, targetDirectory);
        Path target = targetDirectory.resolve(fileName).normalize();
        try {
            Files.write(target, decodedBytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la imagen", e);
        }
        return publicPathPrefix + "/" + categoriaCarpeta + "/" + fileName;
    }

    private Path ensureCategoriaDirectory(String categoriaCarpeta) {
        Path directory = storageDirectory.resolve(categoriaCarpeta).normalize();
        try {
            Files.createDirectories(directory);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear el directorio para la categoría " + categoriaCarpeta, e);
        }
        return directory;
    }

    private String buildUniqueFileName(String productoNombre, String extension, Path directory) {
        String slugBase = slugify(productoNombre);
        if (!StringUtils.hasText(slugBase)) {
            slugBase = UUID.randomUUID().toString().replace("-", "");
        }
        String candidate = slugBase + "." + extension;
        Path candidatePath = directory.resolve(candidate).normalize();
        int index = 1;
        while (Files.exists(candidatePath)) {
            candidate = slugBase + "-" + index + "." + extension;
            candidatePath = directory.resolve(candidate).normalize();
            index++;
        }
        return candidate;
    }

    private String sanitizeCategoria(String categoria) {
        if (!StringUtils.hasText(categoria)) {
            return "generico";
        }
        return slugify(categoria);
    }

    private String slugify(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = normalized.toLowerCase();
        String slug = NON_LATIN.matcher(lower).replaceAll("-");
        slug = slug.replaceAll("--+", "-");
        return TRIM_DASH.matcher(slug).replaceAll("");
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
        String trimmed = value;
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
