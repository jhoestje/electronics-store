package com.store.electronics.service;

import com.store.electronics.dto.AuthRequest;
import com.store.electronics.dto.AuthResponse;
import com.store.electronics.dto.RegisterRequest;
import com.store.electronics.exception.EmailExistsException;
import com.store.electronics.exception.InvalidPasswordException;
import com.store.electronics.exception.UsernameExistsException;
import com.store.electronics.model.User;
import com.store.electronics.repository.UserRepository;
import com.store.electronics.security.JwtUtil;
import com.store.electronics.validation.PasswordValidator;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    // Explicit constructor for IDE compatibility
    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager,
                      JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailExistsException("Email already exists");
        }

        // Validate password strength
        PasswordValidator.ValidationResult passwordValidation = PasswordValidator.validatePassword(request.getPassword());
        if (!passwordValidation.isValid()) {
            throw new InvalidPasswordException(passwordValidation.getErrorMessage());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        // Check if this is the first user and assign admin role
        if (userRepository.count() == 0) {
            user.setRoles(new HashSet<>(Collections.singletonList("ROLE_ADMIN")));
        } else {
            user.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));
        }

        user = userRepository.save(user);

        return AuthResponse.builder()
                .user(user)
                .token(jwtUtil.generateToken(user.getUsername(), List.copyOf(user.getRoles())))
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
                .token(jwtUtil.generateToken(user.getUsername(), List.copyOf(user.getRoles())))
                .build();
    }
}
