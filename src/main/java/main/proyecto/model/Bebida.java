package main.proyecto.model;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "bebidas")
@Data
public class Bebida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private double price;

    private String size;  // e.g., "500ml"

    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> ingredients;  // Opcional, e.g., ["azúcar", "colorantes"]

    private String imageUrl;

    private int stockQuantity;

    private int lowStockThreshold;
}