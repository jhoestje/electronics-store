package com.store.electronics.service;

import com.store.electronics.dto.AuthRequest;
import com.store.electronics.dto.AuthResponse;
import com.store.electronics.dto.RegisterRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

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
}
