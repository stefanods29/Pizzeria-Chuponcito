package main.proyecto.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(name = "promo_price")
    private BigDecimal promoPrice;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "items", columnDefinition = "json")
    private String items; 

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "stock_quantity")
    private int stockQuantity;

    @Column(name = "low_stock_threshold")
    private int lowStockThreshold;
}
