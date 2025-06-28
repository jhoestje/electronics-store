package com.store.electronics.service;

import com.store.electronics.dto.AuthRequest;
import com.store.electronics.dto.AuthResponse;
import com.store.electronics.dto.RegisterRequest;
import com.store.electronics.exception.InvalidPasswordException;
import com.store.electronics.exception.ResourceExistsException;
import com.store.electronics.model.User;
import com.store.electronics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    
    // Password validation regex patterns
    private static final Pattern HAS_UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern HAS_LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern HAS_NUMBER = Pattern.compile("\\d");
    private static final Pattern HAS_SPECIAL_CHAR = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceExistsException("Username already exists");
        }

        // Validate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceExistsException("Email already exists");
        }
        
        // Validate password strength
        validatePassword(request.getPassword());

        // Create and save the new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));

        user = userRepository.save(user);
        
        // For testing purposes, create an admin user if this is the first user
        if (userRepository.count() == 1) {
            user.setRoles(new HashSet<>(Collections.singletonList("ROLE_ADMIN")));
            user = userRepository.save(user);
        }

        return AuthResponse.builder()
                .user(user)
                .token("dummy-token") // We'll implement proper JWT later
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .user(user)
                .token("dummy-token") // We'll implement proper JWT later
                .build();
    }
    
    /**
     * Validates password strength based on criteria:
     * - At least 8 characters
     * - At least one uppercase letter for stronger passwords
     * - At least one lowercase letter
     * - At least one number for stronger passwords
     * - At least one special character for stronger passwords
     */
    private void validatePassword(String password) {
        // Basic validation - password must be at least 8 characters
        if (password == null || password.length() < 8) {
            throw new InvalidPasswordException("Password must be at least 8 characters long");
        }
        
        // Advanced validation for stronger passwords
        if (!HAS_UPPERCASE.matcher(password).find()) {
            throw new InvalidPasswordException("Password must contain at least one uppercase letter");
        }
        
        if (!HAS_LOWERCASE.matcher(password).find()) {
            throw new InvalidPasswordException("Password must contain at least one lowercase letter");
        }
        
        if (!HAS_NUMBER.matcher(password).find()) {
            throw new InvalidPasswordException("Password must contain at least one number");
        }
        
        // Only require special characters for very strong passwords
        if (!HAS_SPECIAL_CHAR.matcher(password).find()) {
            throw new InvalidPasswordException("Password must contain at least one special character");
        }
    }
}
