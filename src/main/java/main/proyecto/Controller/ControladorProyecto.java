package main.proyecto.Controller;

import main.proyecto.model.Pizza;
import main.proyecto.model.Promotion;
import main.proyecto.model.Bebida;
import main.proyecto.model.Extra;
import main.proyecto.model.User;
import main.proyecto.model.Role;
import main.proyecto.dto.RegisterRequest;
import main.proyecto.dto.ContactRequest;
import main.proyecto.dto.CartItem;
import main.proyecto.repository.PizzaRepository;
import main.proyecto.repository.PromotionRepository;
import main.proyecto.repository.BebidaRepository;
import main.proyecto.repository.ExtraRepository;
import main.proyecto.repository.UserRepository;
import main.proyecto.repository.OrderRepository;
import main.proyecto.model.Order;
import main.proyecto.model.CustomUserDetails;
import main.proyecto.dto.ProfileUpdateRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Optional;

@Controller
public class ControladorProyecto {

    @Autowired
    private PizzaRepository pizzaRepository;
    @Autowired
    private ExtraRepository extraRepository;
    @Autowired
    private BebidaRepository bebidaRepository;
    @Autowired
    private PromotionRepository promotionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/")
    public String index(Model model) {
        // Lógica para obtener las 3 pizzas más vendidas
        List<Order> allOrders = orderRepository.findAll();
        Map<Long, Integer> pizzaCounts = new HashMap<>();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (Order order : allOrders) {
            if (order.getItems() != null) {
                try {
                    CartItem[] items = mapper.readValue(order.getItems(), CartItem[].class);
                    for (CartItem item : items) {
                        if ("pizza".equals(item.getType())) {
                            pizzaCounts.put(item.getProductId(),
                                    pizzaCounts.getOrDefault(item.getProductId(), 0) + item.getQuantity());
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace(); // Log error parsing items
                }
            }
        }

        // Ordenar por cantidad descendente
        List<Long> topPizzaIds = pizzaCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        List<Pizza> topPizzas = new ArrayList<>();
        if (!topPizzaIds.isEmpty()) {
            List<Pizza> foundPizzas = pizzaRepository.findAllById(topPizzaIds);
            // Mantener el orden del ranking
            for (Long id : topPizzaIds) {
                foundPizzas.stream().filter(p -> p.getId().equals(id)).findFirst().ifPresent(topPizzas::add);
            }
        }

        // Si no hay suficientes ventas, rellenar con pizzas por defecto (las primeras
        // 3)
        if (topPizzas.size() < 3) {
            List<Pizza> allPizzas = pizzaRepository.findAll();
            for (Pizza p : allPizzas) {
                if (topPizzas.size() >= 3)
                    break;
                if (!topPizzas.contains(p)) {
                    topPizzas.add(p);
                }
            }
        }

        model.addAttribute("topPizzas", topPizzas);

        model.addAttribute("contactRequest", new ContactRequest());
        model.addAttribute("title", "Chuponcito — La Mejor Pizza Recién Hecha");
        model.addAttribute("cssFile", "style_index.css");
        model.addAttribute("activePage", "inicio");

        return "index";
    }

    @GetMapping("/menuCompleto")
    public String menuCompleto(Model model) {
        List<Pizza> pizzas = pizzaRepository.findAll();
        model.addAttribute("pizzas", pizzas);

        List<Extra> extras = extraRepository.findAll();
        model.addAttribute("extras", extras);

        List<Bebida> bebidas = bebidaRepository.findAll();
        model.addAttribute("bebidas", bebidas);

        model.addAttribute("title", "Menú Completo — Chuponcito");
        model.addAttribute("cssFile", "style_menuCompleto.css");
        model.addAttribute("activePage", "menu");

        return "menuCompleto";
    }

    @GetMapping("/promociones")
    public String promociones(Model model) {
        // 1. Obtener todas las promociones activas para la sección de ofertas
        List<Promotion> allPromotions = promotionRepository.findByIsActiveTrue();
        model.addAttribute("promociones", allPromotions);

        // 2. Lógica para obtener los 2 combos (promociones) más vendidos
        List<Order> allOrders = orderRepository.findAll();
        Map<Long, Integer> promoCounts = new HashMap<>();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (Order order : allOrders) {
            if (order.getItems() != null) {
                try {
                    CartItem[] items = mapper.readValue(order.getItems(), CartItem[].class);
                    for (CartItem item : items) {
                        // Verificar si el tipo es "promo"
                        if ("promo".equals(item.getType())) {
                            promoCounts.put(item.getProductId(),
                                    promoCounts.getOrDefault(item.getProductId(), 0) + item.getQuantity());
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        // Ordenar por cantidad descendente y tomar los top 2
        List<Long> topPromoIds = promoCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        List<Promotion> topPromotions = new ArrayList<>();
        if (!topPromoIds.isEmpty()) {
            List<Promotion> foundPromos = promotionRepository.findAllById(topPromoIds);
            // Mantener el orden del ranking
            for (Long id : topPromoIds) {
                foundPromos.stream().filter(p -> p.getId().equals(id)).findFirst().ifPresent(topPromotions::add);
            }
        }

        // Rellenar si no hay suficientes ventas
        if (topPromotions.size() < 2) {
            for (Promotion p : allPromotions) {
                if (topPromotions.size() >= 2)
                    break;
                if (!topPromotions.contains(p)) {
                    topPromotions.add(p);
                }
            }
        }

        model.addAttribute("topPromotions", topPromotions);

        model.addAttribute("title", "Promociones — Chuponcito");
        model.addAttribute("cssFile", "style_promociones.css");
        model.addAttribute("activePage", "promociones");

        return "promociones";
    }

    @GetMapping("/contacto")
    public String contacto(Model model) {
        model.addAttribute("contactRequest", new ContactRequest());
        model.addAttribute("title", "Contacto — Chuponcito");
        model.addAttribute("cssFile", "style_contacto.css");
        model.addAttribute("activePage", "contacto");

        return "contacto";
    }

    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("title", "Iniciar Sesion — Chuponcito");
        model.addAttribute("cssFile", "style_login.css");
        model.addAttribute("activePage", "inicio");

        return "login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registerRequest", new RegisterRequest());
        model.addAttribute("title", "Registrarse — Chuponcito");
        model.addAttribute("cssFile", "style_register.css");
        model.addAttribute("activePage", "inicio");

        return "register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registerRequest") RegisterRequest registerRequest,
            BindingResult bindingResult, Model model, RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");

            return "register";
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            bindingResult.rejectValue("email", "error.email", "El email ya está registrado.");
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");

            return "register";
        }
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            bindingResult.rejectValue("username", "error.username", "El nombre de usuario ya existe.");
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");

            return "register";
        }
        // Validar teléfono duplicado
        if (userRepository.existsByTelefono(registerRequest.getTelefono())) {
            bindingResult.rejectValue("telefono", "error.telefono", "El teléfono ya está registrado.");
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");

            return "register";
        }

        // Crea y guarda User
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setTelefono(registerRequest.getTelefono()); // Guardar teléfono
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setRole(Role.USER);
        newUser.setEnabled(true);
        userRepository.save(newUser);

        redirectAttributes.addFlashAttribute("message", "¡Registro exitoso! Revisa tu email para confirmar.");
        return "redirect:/login";
    }

    @PostMapping("/contacto")
    public String contact(@Valid @ModelAttribute("contactRequest") ContactRequest contactRequest,
            BindingResult bindingResult, Model model, RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("contactRequest", contactRequest);
            model.addAttribute("title", "Chuponcito — La Mejor Pizza Recién Hecha");
            model.addAttribute("cssFile", "style_index.css");
            model.addAttribute("activePage", "inicio");

            return "index";
        }

        redirectAttributes.addFlashAttribute("message", "¡Enviado con éxito! Te contactaremos pronto.");
        return "redirect:/";
    }

    // Endpoints para roles
    @GetMapping("/user/pedidos")
    @PreAuthorize("hasRole('USER')")
    public String userPedidos(Model model, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        List<Order> orders = new ArrayList<>();
        Map<Long, List<CartItem>> orderItemsMap = new HashMap<>();

        if (user != null) {
            orders = orderRepository.findByUserIdOrderByIdDesc(user.getId());

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            for (Order order : orders) {
                if (order.getItems() != null) {
                    try {
                        List<CartItem> items = java.util.Arrays
                                .asList(mapper.readValue(order.getItems(), CartItem[].class));
                        orderItemsMap.put(order.getId(), items);
                    } catch (Exception e) {
                        e.printStackTrace();
                        orderItemsMap.put(order.getId(), new ArrayList<>());
                    }
                } else {
                    orderItemsMap.put(order.getId(), new ArrayList<>());
                }
            }
        }

        model.addAttribute("title", "Mis Pedidos — Chuponcito");
        model.addAttribute("cssFile", "style_user.css");
        model.addAttribute("activePage", "user");

        model.addAttribute("orders", orders);
        model.addAttribute("orderItemsMap", orderItemsMap);
        model.addAttribute("userEmail", email);
        return "orders";
    }

    @GetMapping("/user/perfil")
    @PreAuthorize("hasRole('USER')")
    public String userPerfil(Model model, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        model.addAttribute("title", "Mi Perfil — Chuponcito");
        model.addAttribute("cssFile", "style_profile.css");
        model.addAttribute("activePage", "user");

        model.addAttribute("user", user);

        // Preparar DTO para el formulario
        ProfileUpdateRequest profileUpdateRequest = new ProfileUpdateRequest();
        if (user != null) {
            profileUpdateRequest.setUsername(user.getUsername());
            profileUpdateRequest.setEmail(user.getEmail());
            profileUpdateRequest.setTelefono(user.getTelefono());
        }
        model.addAttribute("profileUpdateRequest", profileUpdateRequest);

        model.addAttribute("userEmail", email);
        return "profile";
    }

    @PostMapping("/user/update")
    @PreAuthorize("hasRole('USER')")
    public String updateProfile(@Valid @ModelAttribute("profileUpdateRequest") ProfileUpdateRequest request,
            BindingResult bindingResult,
            Model model,
            Authentication auth,
            RedirectAttributes redirectAttributes) {

        String currentEmail = auth.getName();
        User currentUser = userRepository.findByEmail(currentEmail).orElse(null);

        if (currentUser == null) {
            return "redirect:/login";
        }

        if (bindingResult.hasErrors()) {
            model.addAttribute("user", currentUser);
            model.addAttribute("title", "Mi Perfil — Chuponcito");
            model.addAttribute("cssFile", "style_user.css");
            model.addAttribute("activePage", "user");
            model.addAttribute("userEmail", currentEmail);
            return "profile";
        }

        // Verificar si hay cambios
        boolean sameUsername = currentUser.getUsername().equals(request.getUsername());
        boolean sameEmail = currentUser.getEmail().equals(request.getEmail());
        boolean samePhone = currentUser.getTelefono().equals(request.getTelefono());
        boolean passwordEmpty = (request.getNewPassword() == null || request.getNewPassword().isBlank());

        if (sameUsername && sameEmail && samePhone && passwordEmpty) {
            redirectAttributes.addFlashAttribute("error", "No se detectaron cambios para actualizar.");
            return "redirect:/user/perfil";
        }

        // Validar unicidad de email si cambió
        if (!currentUser.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            redirectAttributes.addFlashAttribute("error", "El email ya está en uso.");
            return "redirect:/user/perfil";
        }

        // Validar unicidad de username si cambió
        if (!currentUser.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            redirectAttributes.addFlashAttribute("error", "El nombre de usuario ya está en uso.");
            return "redirect:/user/perfil";
        }

        // Validar unicidad de teléfono si cambió
        if (!currentUser.getTelefono().equals(request.getTelefono())
                && userRepository.existsByTelefono(request.getTelefono())) {
            redirectAttributes.addFlashAttribute("error", "El teléfono ya está en uso.");
            return "redirect:/user/perfil";
        }

        // Actualizar datos
        currentUser.setUsername(request.getUsername());
        currentUser.setEmail(request.getEmail());
        currentUser.setTelefono(request.getTelefono());

        // Actualizar contraseña si se proporcionó
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            // La validación de longitud ya la hace el DTO con @Pattern
            currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(currentUser);

        // Actualizar SecurityContext con los nuevos datos
        CustomUserDetails newUserDetails = new CustomUserDetails(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getUsername(),
                currentUser.getUsername(), // Usamos username como displayName
                currentUser.getPassword(),
                currentUser.isEnabled(),
                currentUser.getRole());

        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                newUserDetails,
                auth.getCredentials(),
                auth.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(newAuth);

        if (!currentEmail.equals(request.getEmail())) {
            redirectAttributes.addFlashAttribute("message",
                    "Perfil actualizado. Por favor inicia sesión con tu nuevo email.");
            return "redirect:/logout";
        }

        redirectAttributes.addFlashAttribute("message", "Perfil actualizado correctamente.");
        return "redirect:/user/perfil";
    }

        @GetMapping("/admin/todos-pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTodosPedidos(Model model) {
        model.addAttribute("title", "Todos los Pedidos — Admin");
        model.addAttribute("cssFile", "style_admin.css");
        model.addAttribute("activePage", "admin");

        List<Order> orders = orderRepository.findAll();
        // Ordenar por ID descendente (más reciente primero)
        orders.sort((o1, o2) -> o2.getId().compareTo(o1.getId()));

        Map<Long, List<CartItem>> orderItemsMap = new HashMap<>();
        Map<Long, User> orderUserMap = new HashMap<>(); // Mapa para guardar el usuario de cada orden
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (Order order : orders) {
            // Procesar items
            if (order.getItems() != null) {
                try {
                    List<CartItem> items = java.util.Arrays
                            .asList(mapper.readValue(order.getItems(), CartItem[].class));
                    orderItemsMap.put(order.getId(), items);
                } catch (Exception e) {
                    e.printStackTrace();
                    orderItemsMap.put(order.getId(), new ArrayList<>());
                }
            } else {
                orderItemsMap.put(order.getId(), new ArrayList<>());
            }

            // Procesar usuario
            if (order.getUserId() != null) {
                userRepository.findById(order.getUserId()).ifPresent(user -> orderUserMap.put(order.getId(), user));
            }
        }

        model.addAttribute("orders", orders);
        model.addAttribute("orderItemsMap", orderItemsMap);
        model.addAttribute("orderUserMap", orderUserMap);
        return "adminTodosPedidos";
    }

    @GetMapping("/admin/pedidos-cliente")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminPedidosCliente(Model model) {
        model.addAttribute("title", "Pedidos por Cliente — Admin");
        model.addAttribute("cssFile", "style_admin.css");
        model.addAttribute("activePage", "admin");

        return "adminPedidosCliente";
    }

    @GetMapping("/carrito")
    public String carrito(Model model, HttpSession session) {
        model.addAttribute("title", "Carrito de Compras — Chuponcito");
        model.addAttribute("cssFile", "style_cart.css");
        model.addAttribute("activePage", "carrito");

        return "cart";
    }

    // GET /checkout - Página con lista items + pago
    @GetMapping("/checkout")
    public String checkoutPage(Model model, HttpSession session) {
        @SuppressWarnings("unchecked")
        Map<String, CartItem> cartMap = (Map<String, CartItem>) session.getAttribute("cart");
        if (cartMap == null || cartMap.isEmpty()) {
            return "redirect:/"; // Vuelve a home si vacío
        }
        List<CartItem> items = new ArrayList<>(cartMap.values());
        double total = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        model.addAttribute("cssFile", "style_checkout.css");
        model.addAttribute("cartItems", items);
        model.addAttribute("total", total);
        model.addAttribute("paymentTypes", List.of("Efectivo", "Tarjeta", "Transferencia")); // Opciones pago
        return "checkout"; // Nueva template checkout.html
    }

    // GET /payment - Página de pago simulada
    @GetMapping("/payment")
    public String paymentPage(Model model, HttpSession session, Authentication auth) {
        model.addAttribute("title", "Pago — Chuponcito");
        model.addAttribute("cssFile", "style_payment.css");
        model.addAttribute("activePage", "pago");

        if (auth != null && auth.isAuthenticated()) {
            main.proyecto.model.CustomUserDetails userDetails = (main.proyecto.model.CustomUserDetails) auth
                    .getPrincipal();
            String email = userDetails.getEmail();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                model.addAttribute("checkoutPhone", userOpt.get().getTelefono());
            }
        }

        // Pass session data to template for JavaScript access
        String paymentType = (String) session.getAttribute("paymentType");
        if (paymentType != null) {
            model.addAttribute("paymentType", paymentType);
        }

        // Recuperar dirección de la sesión
        String checkoutAddress = (String) session.getAttribute("checkoutAddress");
        if (checkoutAddress != null) {
            model.addAttribute("checkoutAddress", checkoutAddress);
        }

        return "payment";
    }

    @PostMapping("/payment")
    public String processPayment(@RequestParam("paymentType") String paymentType,
            @RequestParam("address") String address, // Recibir dirección del form
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        if (paymentType == null || paymentType.trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Selecciona un tipo de pago válido.");
            return "redirect:/checkout";
        }

        // Guarda paymentType y address en sesión
        session.setAttribute("paymentType", paymentType);
        session.setAttribute("checkoutAddress", address);

        // Opcional: Valida carrito no vacío (ya lo haces in GET /checkout)
        @SuppressWarnings("unchecked")
        Map<String, CartItem> cartMap = (Map<String, CartItem>) session.getAttribute("cart");
        if (cartMap == null || cartMap.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Carrito vacío. No se puede procesar.");
            return "redirect:/";
        }

        redirectAttributes.addFlashAttribute("message", "Pago iniciado con " + paymentType + ".");
        return "redirect:/payment"; // Redirige al GET /payment para mostrar la simulación
    }

    @GetMapping("/order-confirmation")
    public String orderConfirmationPage(@RequestParam("orderId") Long orderId, Model model) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            model.addAttribute("order", order);

            // Parse items JSON to list for display
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            try {
                List<CartItem> items = java.util.Arrays.asList(mapper.readValue(order.getItems(), CartItem[].class));
                model.addAttribute("orderItems", items);
            } catch (Exception e) {
                e.printStackTrace();
                model.addAttribute("orderItems", new ArrayList<>());
            }

            model.addAttribute("title", "Confirmación de Orden — Chuponcito");
            model.addAttribute("cssFile", "style_order_confirmation.css");
            model.addAttribute("activePage", "pago");

            return "order-confirmation";
        } else {
            return "redirect:/";
        }
    }
}