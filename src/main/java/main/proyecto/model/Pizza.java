package main.proyecto.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.Map;

import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "pizzas")
@Data
public class Pizza {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Double> sizes;

    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> ingredients;

    private String imageUrl;

    private int stockQuantity;

    private int lowStockThreshold;
}