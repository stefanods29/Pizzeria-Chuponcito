package main.proyecto.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import main.proyecto.model.Bebida;
import main.proyecto.model.Extra;
import main.proyecto.model.Pizza;
import main.proyecto.repository.BebidaRepository;
import main.proyecto.repository.ExtraRepository;
import main.proyecto.repository.PizzaRepository;
import main.proyecto.repository.PromotionRepository;

@RestController
public class ApiPromos {
    @Autowired
    private PizzaRepository pizzaRepository;
    @Autowired
    private ExtraRepository extraRepository;
    @Autowired
    private BebidaRepository bebidaRepository;
    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping("/api/promociones/{id}/detalles")
    @ResponseBody
    public ResponseEntity<?> getPromotionDetails(@PathVariable Long id) {

        return promotionRepository.findById(id).map(promo -> {
            Map<String, Object> response = new HashMap<>();
            response.put("name", promo.getName());
            response.put("description", promo.getDescription());
            response.put("promoPrice", promo.getPromoPrice());
            response.put("imageUrl", promo.getImageUrl());

            // parsear JSON items
            List<Map<String, Object>> detalles = new ArrayList<>();
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> items = mapper.readValue(promo.getItems(), List.class);

                for (Map<String, Object> item : items) {
                    Map<String, Object> detalle = new HashMap<>();

                    if (item.containsKey("pizza_id")) {
                        Long pizzaId = Long.valueOf(item.get("pizza_id").toString());
                        Pizza pizza = pizzaRepository.findById(pizzaId).orElse(null);
                        detalle.put("tipo", "pizza");
                        detalle.put("nombre", pizza != null ? pizza.getName() : "Pizza desconocida");
                        detalle.put("cantidad", item.get("quantity"));
                        if (item.containsKey("size")) {
                            detalle.put("size", item.get("size"));
                        }
                    } else if (item.containsKey("bebida_id")) {
                        Long bebidaId = Long.valueOf(item.get("bebida_id").toString());
                        Bebida bebida = bebidaRepository.findById(bebidaId).orElse(null);
                        detalle.put("tipo", "bebida");
                        detalle.put("nombre", bebida != null ? bebida.getName() : "Bebida desconocida");
                        detalle.put("cantidad", item.get("quantity"));
                    } else if (item.containsKey("extra_id")) {
                        Long extraId = Long.valueOf(item.get("extra_id").toString());
                        Extra extra = extraRepository.findById(extraId).orElse(null);
                        detalle.put("tipo", "extra");
                        detalle.put("nombre", extra != null ? extra.getName() : "Extra desconocido");
                        detalle.put("cantidad", item.get("quantity"));
                    }
                    detalles.add(detalle);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            response.put("detalles", detalles);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
