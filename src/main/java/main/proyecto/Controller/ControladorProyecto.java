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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import java.util.ArrayList;

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
    private PasswordEncoder passwordEncoder;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("contactRequest", new ContactRequest());
        model.addAttribute("title", "Chuponcito — La Mejor Pizza Recién Hecha");
        model.addAttribute("cssFile", "style_index.css");
        model.addAttribute("activePage", "inicio");
        model.addAttribute("searchPlaceholder", "Buscar pizza, ingrediente...");
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
        model.addAttribute("searchPlaceholder", "Buscar pizza...");
        return "menuCompleto";
    }

    @GetMapping("/promociones")
    public String promociones(Model model) {
        List<Promotion> promociones = promotionRepository.findByIsActiveTrue();
        model.addAttribute("promociones", promociones);

        model.addAttribute("title", "Promociones — Chuponcito");
        model.addAttribute("cssFile", "style_promociones.css");
        model.addAttribute("activePage", "promociones");
        model.addAttribute("searchPlaceholder", "Buscar promoción...");
        return "promociones";
    }

    @GetMapping("/contacto")
    public String contacto(Model model) {
        model.addAttribute("contactRequest", new ContactRequest());
        model.addAttribute("title", "Contacto — Chuponcito");
        model.addAttribute("cssFile", "style_contacto.css");
        model.addAttribute("activePage", "contacto");
        model.addAttribute("searchPlaceholder", "Buscar...");
        return "contacto";
    }

    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("title", "Iniciar Sesion — Chuponcito");
        model.addAttribute("cssFile", "style_login.css");
        model.addAttribute("activePage", "inicio");
        model.addAttribute("searchPlaceholder", "Buscar...");
        return "login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registerRequest", new RegisterRequest());
        model.addAttribute("title", "Registrarse — Chuponcito");
        model.addAttribute("cssFile", "style_register.css");
        model.addAttribute("activePage", "inicio");
        model.addAttribute("searchPlaceholder", "Buscar...");
        return "register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registerRequest") RegisterRequest registerRequest,
            BindingResult bindingResult, Model model, RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");
            model.addAttribute("searchPlaceholder", "Buscar...");
            return "register";
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            bindingResult.rejectValue("email", "error.email", "El email ya está registrado.");
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");
            model.addAttribute("searchPlaceholder", "Buscar...");
            return "register";
        }
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            bindingResult.rejectValue("username", "error.username", "El nombre de usuario ya existe.");
            model.addAttribute("title", "Registrarse — Chuponcito");
            model.addAttribute("cssFile", "style_register.css");
            model.addAttribute("activePage", "inicio");
            model.addAttribute("searchPlaceholder", "Buscar...");
            return "register";
        }

        // Crea y guarda User
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
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
            model.addAttribute("searchPlaceholder", "Buscar pizza, ingrediente...");
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
        model.addAttribute("title", "Mis Pedidos — Chuponcito");
        model.addAttribute("cssFile", "style_user.css");
        model.addAttribute("activePage", "user");
        model.addAttribute("searchPlaceholder", "Buscar mis pedidos...");
        model.addAttribute("pedidos", List.of("Tus pedidos aquí"));
        model.addAttribute("userEmail", email);
        return "orders";
    }

    @GetMapping("/user/perfil")
    @PreAuthorize("hasRole('USER')")
    public String userPerfil(Model model, Authentication auth) {
        String email = auth.getName();
        model.addAttribute("title", "Mi Perfil — Chuponcito");
        model.addAttribute("cssFile", "style_user.css");
        model.addAttribute("activePage", "user");
        model.addAttribute("searchPlaceholder", "Buscar mis pedidos...");
        model.addAttribute("Pizza", List.of("Pizzas aca"));
        model.addAttribute("userEmail", email);
        return "profile";
    }

    @GetMapping("/admin/todos-pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminTodosPedidos(Model model) {
        model.addAttribute("title", "Todos los Pedidos — Admin");
        model.addAttribute("cssFile", "style_admin.css");
        model.addAttribute("activePage", "admin");
        model.addAttribute("searchPlaceholder", "Buscar pedidos...");
        model.addAttribute("pedidos", List.of("Placeholder: Todos los pedidos"));
        return "adminTodosPedidos";
    }

    @GetMapping("/admin/pedidos-cliente")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminPedidosCliente(Model model) {
        model.addAttribute("title", "Pedidos por Cliente — Admin");
        model.addAttribute("cssFile", "style_admin.css");
        model.addAttribute("activePage", "admin");
        model.addAttribute("searchPlaceholder", "Buscar por cliente...");
        return "adminPedidosCliente";
    }

    @GetMapping("/carrito")
    public String carrito(Model model, HttpSession session) {
        model.addAttribute("title", "Carrito de Compras — Chuponcito");
        model.addAttribute("cssFile", "style_cart.css"); 
        model.addAttribute("activePage", "carrito");
        model.addAttribute("searchPlaceholder", "Buscar en carrito...");
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
        model.addAttribute("cartItems", items);
        model.addAttribute("total", total);
        model.addAttribute("paymentTypes", List.of("Efectivo", "Tarjeta", "Transferencia")); // Opciones pago
        return "checkout"; // Nueva template checkout.html
    }

    // GET /payment - Página de pago simulada
    @GetMapping("/payment")
    public String paymentPage(Model model) {
        model.addAttribute("title", "Pago — Chuponcito");
        model.addAttribute("cssFile", "style_payment.css");
        model.addAttribute("activePage", "pago");
        model.addAttribute("searchPlaceholder", "Buscar pago...");
        return "payment";
    }

    @PostMapping("/payment")
    public String processPayment(@RequestParam("paymentType") String paymentType, HttpSession session, RedirectAttributes redirectAttributes) {
    if (paymentType == null || paymentType.trim().isEmpty()) {
        redirectAttributes.addFlashAttribute("error", "Selecciona un tipo de pago válido.");
        return "redirect:/checkout";
    }
    
    // Guarda paymentType en sesión para usarlo en la página de payment
    session.setAttribute("paymentType", paymentType);
    
    // Opcional: Valida carrito no vacío (ya lo haces en GET /checkout)
    @SuppressWarnings("unchecked")
    Map<String, CartItem> cartMap = (Map<String, CartItem>) session.getAttribute("cart");
    if (cartMap == null || cartMap.isEmpty()) {
        redirectAttributes.addFlashAttribute("error", "Carrito vacío. No se puede procesar.");
        return "redirect:/";
    }
    
    redirectAttributes.addFlashAttribute("message", "Pago iniciado con " + paymentType + ".");
    return "redirect:/payment";  // Redirige al GET /payment para mostrar la simulación
}
}