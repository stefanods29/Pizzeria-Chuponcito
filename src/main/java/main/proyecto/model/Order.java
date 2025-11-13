package main.proyecto.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 20)
    private String status = "pending";

    @Column(columnDefinition = "JSON")
    private String items;

    private String deliveryAddress;
    private String paymentType;

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    private String phone;

    private String notes;

    private Integer estimatedTime;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}