package main.proyecto.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import main.proyecto.dto.CartItem;
import main.proyecto.model.Bebida;
import main.proyecto.model.Extra;
import main.proyecto.model.Order;
import main.proyecto.model.Pizza;
import main.proyecto.model.Promotion;
import main.proyecto.model.User;
import main.proyecto.model.CustomUserDetails;
import main.proyecto.repository.BebidaRepository;
import main.proyecto.repository.ExtraRepository;
import main.proyecto.repository.OrderRepository;
import main.proyecto.repository.PizzaRepository;
import main.proyecto.repository.PromotionRepository;
import main.proyecto.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
@Controller // Para views en GET /checkout
public class CartController {

    @Autowired
    private PizzaRepository pizzaRepository;
    @Autowired
    private ExtraRepository extraRepository;
    @Autowired
    private BebidaRepository bebidaRepository;
    @Autowired
    private PromotionRepository promotionRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(HttpSession session) {
        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null) {
            cartMap = new LinkedHashMap<>();
        }
        List<CartItem> items = new ArrayList<>(cartMap.values());
        double total = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", total);
        response.put("itemCount", items.stream().mapToInt(CartItem::getQuantity).sum());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(@RequestBody CartItem item, HttpSession session) {
        if (item.getQuantity() == null || item.getQuantity() < 1) {
            item.setQuantity(1);
        }
        // Resolver imageUrl y validar
        resolveItemDetails(item);

        // Check stock
        String errorMsg = checkStock(item, item.getQuantity());
        if (errorMsg != null) {
            return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
        }

        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null) {
            cartMap = new LinkedHashMap<>();
        }
        String key = generateKey(item);
        CartItem existing = cartMap.get(key);

        if (existing != null) {
            // Check stock for total quantity
            errorMsg = checkStock(item, existing.getQuantity() + item.getQuantity());
            if (errorMsg != null) {
                return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
            }
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
        } else {
            cartMap.put(key, item);
        }
        session.setAttribute("cart", cartMap);
        return ResponseEntity.ok("Item agregado al carrito exitosamente");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateItem(@RequestBody CartItem item, HttpSession session) {
        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null) {
            return ResponseEntity.notFound().build();
        }
        String key = generateKey(item);
        CartItem existing = cartMap.get(key);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (item.getQuantity() < 1) {
            cartMap.remove(key);
            session.setAttribute("cart", cartMap);
            return ResponseEntity.ok("Item removido del carrito");
        }

        // Check stock
        String errorMsg = checkStock(item, item.getQuantity());
        if (errorMsg != null) {
            return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
        }

        existing.setQuantity(item.getQuantity());
        session.setAttribute("cart", cartMap);
        return ResponseEntity.ok("Cantidad actualizada");
    }

    private String checkStock(CartItem item, int quantity) {
        switch (item.getType()) {
            case "pizza" -> {
                Optional<Pizza> p = pizzaRepository.findById(item.getProductId());
                if (p.isPresent()) {
                    if (p.get().getStockQuantity() < quantity) {
                        return "No hay suficiente stock para la pizza: " + p.get().getName();
                    }
                } else {
                    return "Pizza no encontrada: " + item.getName();
                }
            }
            case "bebida" -> {
                Optional<Bebida> b = bebidaRepository.findById(item.getProductId());
                if (b.isPresent()) {
                    if (b.get().getStockQuantity() < quantity) {
                        return "No hay suficiente stock para la bebida: " + b.get().getName();
                    }
                } else {
                    return "Bebida no encontrada: " + item.getName();
                }
            }
            case "extra" -> {
                Optional<Extra> e = extraRepository.findById(item.getProductId());
                if (e.isPresent()) {
                    if (e.get().getStockQuantity() < quantity) {
                        return "No hay suficiente stock para el extra: " + e.get().getName();
                    }
                } else {
                    return "Extra no encontrado: " + item.getName();
                }
            }
            case "promo" -> {
                Optional<Promotion> pr = promotionRepository.findById(item.getProductId());
                if (pr.isPresent()) {
                    if (pr.get().getStockQuantity() < quantity) {
                        return "No hay suficiente stock para la promoción: " + pr.get().getName();
                    }
                } else {
                    return "Promoción no encontrada: " + item.getName();
                }
            }
        }
        return null;
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeItem(@RequestBody CartItem item, HttpSession session) {
        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null) {
            return ResponseEntity.notFound().build();
        }
        String key = generateKey(item);
        if (cartMap.remove(key) != null) {
            session.setAttribute("cart", cartMap);
            return ResponseEntity.ok("Item removido del carrito");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(HttpSession session) {
        session.removeAttribute("cart");
        return ResponseEntity.ok("Carrito limpiado");
    }

    // GET /checkout - Página con lista items + pago
    @GetMapping("/checkout")
    public String checkoutPage(Model model, HttpSession session) {
        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null || cartMap.isEmpty()) {
            return "redirect:/";
        }
        List<CartItem> items = new ArrayList<>(cartMap.values());
        double total = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        model.addAttribute("cartItems", items);
        model.addAttribute("total", total);
        model.addAttribute("paymentTypes", List.of("Efectivo", "Tarjeta", "Transferencia")); // Opciones pago
        return "checkout";
    }

    // POST /finalizeOrder - Guarda orden después "pago" simulado
    @PostMapping("/finalizeOrder")
    public ResponseEntity<Map<String, Object>> finalizeOrder(@RequestBody Map<String, Object> requestData,
            HttpSession session, Authentication auth) {
        Map<String, CartItem> cartMap = getCartMapSafely(session);
        if (cartMap == null || cartMap.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Carrito vacío."));
        }

        List<CartItem> items = new ArrayList<>(cartMap.values());

        // 1. Validate Stock
        for (CartItem item : items) {
            String errorMsg = null;
            switch (item.getType()) {
                case "pizza" -> {
                    Optional<Pizza> p = pizzaRepository.findById(item.getProductId());
                    if (p.isPresent()) {
                        if (p.get().getStockQuantity() < item.getQuantity()) {
                            errorMsg = "No hay suficiente stock para la pizza: " + p.get().getName();
                        }
                    } else {
                        errorMsg = "Pizza no encontrada: " + item.getName();
                    }
                }
                case "bebida" -> {
                    Optional<Bebida> b = bebidaRepository.findById(item.getProductId());
                    if (b.isPresent()) {
                        if (b.get().getStockQuantity() < item.getQuantity()) {
                            errorMsg = "No hay suficiente stock para la bebida: " + b.get().getName();
                        }
                    } else {
                        errorMsg = "Bebida no encontrada: " + item.getName();
                    }
                }
                case "extra" -> {
                    Optional<Extra> e = extraRepository.findById(item.getProductId());
                    if (e.isPresent()) {
                        if (e.get().getStockQuantity() < item.getQuantity()) {
                            errorMsg = "No hay suficiente stock para el extra: " + e.get().getName();
                        }
                    } else {
                        errorMsg = "Extra no encontrado: " + item.getName();
                    }
                }
                case "promo" -> {
                    Optional<Promotion> pr = promotionRepository.findById(item.getProductId());
                    if (pr.isPresent()) {
                        if (pr.get().getStockQuantity() < item.getQuantity()) {
                            errorMsg = "No hay suficiente stock para la promoción: " + pr.get().getName();
                        }
                    } else {
                        errorMsg = "Promoción no encontrada: " + item.getName();
                    }
                }
            }

            if (errorMsg != null) {
                return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
            }
        }

        // 2. Deduct Stock
        for (CartItem item : items) {
            switch (item.getType()) {
                case "pizza" -> {
                    Pizza p = pizzaRepository.findById(item.getProductId()).get();
                    p.setStockQuantity(p.getStockQuantity() - item.getQuantity());
                    pizzaRepository.save(p);
                }
                case "bebida" -> {
                    Bebida b = bebidaRepository.findById(item.getProductId()).get();
                    b.setStockQuantity(b.getStockQuantity() - item.getQuantity());
                    bebidaRepository.save(b);
                }
                case "extra" -> {
                    Extra e = extraRepository.findById(item.getProductId()).get();
                    e.setStockQuantity(e.getStockQuantity() - item.getQuantity());
                    extraRepository.save(e);
                }
                case "promo" -> {
                    Promotion pr = promotionRepository.findById(item.getProductId()).get();
                    pr.setStockQuantity(pr.getStockQuantity() - item.getQuantity());
                    promotionRepository.save(pr);
                }
            }
        }

        double total = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        ObjectMapper objectMapper = new ObjectMapper();
        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error procesando items: " + e.getMessage()));
        }

        Order order = new Order();
        Long userId = null;
        String userPhone = null;
        if (auth != null && auth.isAuthenticated()) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String email = userDetails.getEmail();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
                userPhone = userOpt.get().getTelefono();
            }
        }
        order.setUserId(userId);
        order.setTotal(BigDecimal.valueOf(total));
        order.setStatus("pending");
        order.setItems(itemsJson);
        order.setDeliveryAddress((String) requestData.get("address"));

        // Use user's phone if available, otherwise use the one from request
        String phoneFromRequest = (String) requestData.get("phone");
        order.setPhone(userPhone != null ? userPhone : phoneFromRequest);
        order.setNotes((String) requestData.get("notes"));

        String paymentType = (String) requestData.get("paymentType");
        if (paymentType == null)
            paymentType = "Efectivo";
        order.setPaymentType(paymentType);

        order.setEstimatedTime(30);

        try {
            orderRepository.save(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error guardando orden: " + e.getMessage()));
        }

        session.removeAttribute("cart");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "¡Pago simulado exitoso! Orden #" + order.getId() + " guardada.");
        response.put("orderId", order.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order-confirmation")
    public String orderConfirmationPage(@RequestParam("orderId") Long orderId, Model model) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            model.addAttribute("order", order);

            // Parse items JSON to list for display if needed, or let frontend handle it if
            // complex
            // For simplicity, we pass the order. The items string is JSON.
            // If we want to display items nicely, we should parse it back to List<CartItem>
            ObjectMapper mapper = new ObjectMapper();
            try {
                List<CartItem> items = Arrays.asList(mapper.readValue(order.getItems(), CartItem[].class));
                model.addAttribute("orderItems", items);
            } catch (Exception e) {
                e.printStackTrace();
                model.addAttribute("orderItems", new ArrayList<>());
            }

            return "order-confirmation";
        } else {
            return "redirect:/";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, CartItem> getCartMapSafely(HttpSession session) {
        Object attribute = session.getAttribute("cart");
        if (attribute instanceof Map) {
            return (Map<String, CartItem>) attribute;
        }
        return null;
    }

    private void resolveItemDetails(CartItem item) {
        switch (item.getType()) {
            case "pizza" -> {
                Optional<Pizza> pizzaOpt = pizzaRepository.findById(item.getProductId());
                if (pizzaOpt.isPresent()) {
                    Pizza pizza = pizzaOpt.get();
                    if (item.getName() == null)
                        item.setName(pizza.getName());
                    item.setImageUrl(pizza.getImageUrl());
                }
            }
            case "extra" -> {
                Optional<Extra> extraOpt = extraRepository.findById(item.getProductId());
                if (extraOpt.isPresent()) {
                    Extra extra = extraOpt.get();
                    if (item.getName() == null)
                        item.setName(extra.getName());
                    item.setImageUrl(extra.getImageUrl());
                }
            }
            case "bebida" -> {
                Optional<Bebida> bebidaOpt = bebidaRepository.findById(item.getProductId());
                if (bebidaOpt.isPresent()) {
                    Bebida bebida = bebidaOpt.get();
                    if (item.getName() == null)
                        item.setName(bebida.getName());
                    item.setImageUrl(bebida.getImageUrl());
                }
            }
            case "promo" -> {
                Optional<Promotion> promoOpt = promotionRepository.findById(item.getProductId());
                if (promoOpt.isPresent()) {
                    Promotion promo = promoOpt.get();
                    if (item.getName() == null)
                        item.setName(promo.getName());
                    if (item.getPrice() == null)
                        item.setPrice(promo.getPromoPrice().doubleValue());
                    item.setImageUrl(promo.getImageUrl());
                }
            }
        }
    }

    private String generateKey(CartItem item) {
        return item.getType() + "_" + item.getProductId() + (item.getSize() != null ? "_" + item.getSize() : "");
    }
}