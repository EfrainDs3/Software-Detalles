package fisi.software.detalles.controller.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Request que resume las preferencias del usuario para generar recomendaciones
 * desde la IA. Se permiten campos nulos para que el servicio pueda aplicar
 * reglas por defecto.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiRecommendationRequest {

    private String eventType;
    private String stylePreference;
    private String colorPreference;
    private String shoeSize;
    private String comfortPriority;
    private String gender;

    public AiRecommendationRequest() {
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getStylePreference() {
        return stylePreference;
    }

    public void setStylePreference(String stylePreference) {
        this.stylePreference = stylePreference;
    }

    public String getColorPreference() {
        return colorPreference;
    }

    public void setColorPreference(String colorPreference) {
        this.colorPreference = colorPreference;
    }

    public String getShoeSize() {
        return shoeSize;
    }

    public void setShoeSize(String shoeSize) {
        this.shoeSize = shoeSize;
    }

    public String getComfortPriority() {
        return comfortPriority;
    }

    public void setComfortPriority(String comfortPriority) {
        this.comfortPriority = comfortPriority;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
