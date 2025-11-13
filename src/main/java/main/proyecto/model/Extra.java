package main.proyecto.model;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "extras")
@Data
public class Extra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private double price;

    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> ingredients;

    private String imageUrl;

    private int stockQuantity;

    private int lowStockThreshold;
}