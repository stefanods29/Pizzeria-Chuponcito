package main.proyecto.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {
    private Long id;
    private String email; // Para auth/login
    private String username; // Para mostrar en navbar
    private String displayName; // Para navbar "Bienvenido, Nombre"
    private String password; // Hasheada
    private boolean enabled;
    private Role role;

    public CustomUserDetails(Long id, String email, String username, String displayName, String password, boolean enabled, Role role) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.displayName = displayName != null ? displayName : username; // Fallback a username
        this.password = password;
        this.enabled = enabled;
        this.role = role;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getUsernameForDisplay() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; 
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public Role getRole() {
        return role;
    }
}