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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=testSecretKeyForTestingPurposesOnly12345678901234567890123456789012345678901234567890",
    "jwt.expiration=86400000"
})
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    private RegisterRequest validRegisterRequest;
    private AuthRequest validAuthRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setUsername("testuser");
        validRegisterRequest.setEmail("test@example.com");
        validRegisterRequest.setPassword("SecurePass123!");

        validAuthRequest = new AuthRequest();
        validAuthRequest.setUsername("testuser");
        validAuthRequest.setPassword("SecurePass123!");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));
        
        // Reset mocks
        reset(userRepository, passwordEncoder, authenticationManager);
    }

    @Test
    @DisplayName("Successful registration should return AuthResponse with JWT token")
    void testSuccessfulRegistration() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.count()).thenReturn(0L); // No users yet — first user gets admin role

        // Act
        AuthResponse response = authService.register(validRegisterRequest);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getUser(), "User should not be null");
        assertNotNull(response.getToken(), "JWT token should be returned");
        assertEquals("testuser", response.getUser().getUsername(), "Username should match");
        assertEquals("test@example.com", response.getUser().getEmail(), "Email should match");
        assertTrue(response.getUser().getRoles().contains("ROLE_ADMIN"), "First user should get admin role");

        // Verify token is valid
        assertTrue(jwtUtil.validateToken(response.getToken()), "Generated token should be valid");
        assertEquals("testuser", jwtUtil.getUsernameFromToken(response.getToken()), "Token should contain correct username");

        // Verify interactions
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("SecurePass123!");
        verify(userRepository, times(1)).save(any(User.class)); // Single save — roles set before save
    }

    @Test
    @DisplayName("Registration with existing username should throw UsernameExistsException")
    void testRegistrationWithExistingUsername() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        UsernameExistsException exception = assertThrows(
            UsernameExistsException.class,
            () -> authService.register(validRegisterRequest)
        );

        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Registration with existing email should throw EmailExistsException")
    void testRegistrationWithExistingEmail() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        EmailExistsException exception = assertThrows(
            EmailExistsException.class,
            () -> authService.register(validRegisterRequest)
        );

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Registration with weak password should throw InvalidPasswordException")
    void testRegistrationWithWeakPassword() {
        // Arrange
        validRegisterRequest.setPassword("weak");
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        // Act & Assert
        InvalidPasswordException exception = assertThrows(
            InvalidPasswordException.class,
            () -> authService.register(validRegisterRequest)
        );

        assertNotNull(exception.getMessage(), "Error message should not be null");
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Second user registration should get customer role")
    void testSecondUserRegistration() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userRepository.count()).thenReturn(2L); // Not first user

        // Act
        AuthResponse response = authService.register(validRegisterRequest);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getToken(), "JWT token should be returned");
        assertTrue(response.getUser().getRoles().contains("ROLE_CUSTOMER"), "Second user should get customer role");
        assertFalse(response.getUser().getRoles().contains("ROLE_ADMIN"), "Second user should not get admin role");

        // Verify token is valid
        assertTrue(jwtUtil.validateToken(response.getToken()), "Generated token should be valid");
        List<String> tokenRoles = jwtUtil.getRolesFromToken(response.getToken());
        assertTrue(tokenRoles.contains("ROLE_CUSTOMER"), "Token should contain customer role");

        verify(userRepository).save(any(User.class)); // Save only once for customer role
    }

    @Test
    @DisplayName("Successful login should return AuthResponse with JWT token")
    void testSuccessfulLogin() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        AuthResponse response = authService.login(validAuthRequest);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getUser(), "User should not be null");
        assertNotNull(response.getToken(), "JWT token should be returned");
        assertEquals("testuser", response.getUser().getUsername(), "Username should match");

        // Verify token is valid
        assertTrue(jwtUtil.validateToken(response.getToken()), "Generated token should be valid");
        assertEquals("testuser", jwtUtil.getUsernameFromToken(response.getToken()), "Token should contain correct username");

        // Verify interactions
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("Login with non-existent user should throw RuntimeException")
    void testLoginWithNonExistentUser() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> authService.login(validAuthRequest)
        );

        assertEquals("User not found", exception.getMessage());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("Generated JWT tokens should be valid and contain correct information")
    void testJwtTokenGeneration() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.count()).thenReturn(0L); // No users yet — first user gets admin role

        // Act
        AuthResponse response = authService.register(validRegisterRequest);

        // Assert JWT token properties
        String token = response.getToken();
        assertNotNull(token, "Token should not be null");
        assertTrue(jwtUtil.validateToken(token), "Token should be valid");
        
        String extractedUsername = jwtUtil.getUsernameFromToken(token);
        assertEquals("testuser", extractedUsername, "Username should match");
        
        List<String> extractedRoles = jwtUtil.getRolesFromToken(token);
        assertTrue(extractedRoles.contains("ROLE_ADMIN"), "Should contain admin role for first user");
    }
}
