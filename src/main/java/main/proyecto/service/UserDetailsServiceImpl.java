package main.proyecto.service;

import main.proyecto.model.User;
import main.proyecto.model.CustomUserDetails;
import main.proyecto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        if (!user.isEnabled()) {
            throw new UsernameNotFoundException("Cuenta deshabilitada: " + email);
        }

        return new CustomUserDetails(
                user.getId(),                    // ¡FIX: ID primero
                user.getEmail(),                 // correo para auth/login
                user.getUsername(),              // nombre para mostrar
                user.getUsername(),              // ¡FIX: displayName fallback a username (agrega getDisplayName() en User si quieres full name)
                user.getPassword(),              // Hasheado
                user.isEnabled(),
                user.getRole()
        );
    }
}