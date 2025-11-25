package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "tipospago")
public class TipoPago implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipopago")
    private Integer idTipoPago;

    @Column(name = "tipo_pago", nullable = false, length = 50)
    private String tipoPago;

    // Constructores
    public TipoPago() {
    }

    public TipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    // Getters y Setters
    public Integer getIdTipoPago() {
        return idTipoPago;
    }

    public void setIdTipoPago(Integer idTipoPago) {
        this.idTipoPago = idTipoPago;
    }

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    @Override
    public String toString() {
        return "TipoPago{" +
                "idTipoPago=" + idTipoPago +
                ", tipoPago='" + tipoPago + '\'' +
                '}';
    }
}
