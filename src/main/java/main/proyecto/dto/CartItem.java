package main.proyecto.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Long productId;
    private String name;
    private String type; // "pizza", "extra", "bebida", "promo"
    private Double price;
    private String size; // Solo para pizzas (puede ser null)
    private Integer quantity = 1;
    private String imageUrl;
}