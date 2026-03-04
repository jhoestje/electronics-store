package com.store.electronics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.electronics.dto.AuthRequest;
import com.store.electronics.dto.AuthResponse;
import com.store.electronics.dto.RegisterRequest;
import com.store.electronics.model.User;
import com.store.electronics.repository.UserRepository;
import com.store.electronics.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=testSecretKeyForTestingPurposesOnly12345678901234567890123456789012345678901234567890",
    "jwt.expiration=86400000"
})
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        userRepository.deleteAll(); // Clean database before each test
    }

    @Test
    @DisplayName("Successful registration should return JWT token and user details")
    void testSuccessfulRegistration() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("SecurePass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.username").value("testuser"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.user.roles").isArray())
                .andExpect(jsonPath("$.user.roles[0]").value("ROLE_ADMIN")); // First user gets admin role
    }

    @Test
    @DisplayName("Successful login should return JWT token and user details")
    void testSuccessfulLogin() throws Exception {
        // Arrange - First register a user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Now test login
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("SecurePass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.username").value("testuser"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.user.roles").isArray());
    }

    @Test
    @DisplayName("Registration with missing fields should return 400")
    void testRegistrationValidationErrors() throws Exception {
        // Arrange
        String invalidJson = """
            {
                "username": "",
                "email": "invalid-email",
                "password": "weak"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login with missing fields should return 400")
    void testLoginValidationErrors() throws Exception {
        // Arrange
        String invalidJson = """
            {
                "username": "",
                "password": ""
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registration with existing username should return 400")
    void testRegistrationWithExistingUsername() throws Exception {
        // Arrange - Create a user first
        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword("encodedPassword");
        existingUser.setRoles(new HashSet<>(List.of("ROLE_CUSTOMER")));
        userRepository.save(existingUser);

        // Now try to register with same username
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setEmail("new@example.com");
        request.setPassword("SecurePass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registration with existing email should return 400")
    void testRegistrationWithExistingEmail() throws Exception {
        // Arrange - Create a user first
        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword("encodedPassword");
        existingUser.setRoles(new HashSet<>(List.of("ROLE_CUSTOMER")));
        userRepository.save(existingUser);

        // Now try to register with same email
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("existing@example.com");
        request.setPassword("SecurePass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registration with weak password should return 400")
    void testRegistrationWithWeakPassword() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("weak");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login with invalid credentials should return 401")
    void testLoginWithInvalidCredentials() throws Exception {
        // Arrange
        AuthRequest request = new AuthRequest();
        request.setUsername("nonexistentuser");
        request.setPassword("wrongpassword");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Second user registration should get customer role")
    void testSecondUserRegistrationRole() throws Exception {
        // Arrange - First register admin user
        RegisterRequest adminRequest = new RegisterRequest();
        adminRequest.setUsername("admin");
        adminRequest.setEmail("admin@example.com");
        adminRequest.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isOk());

        // Now register second user
        RegisterRequest customerRequest = new RegisterRequest();
        customerRequest.setUsername("customer");
        customerRequest.setEmail("customer@example.com");
        customerRequest.setPassword("SecurePass123!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.roles[0]").value("ROLE_CUSTOMER"));
    }

    @Test
    @DisplayName("Generated JWT token should be valid")
    void testGeneratedTokenValidity() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("SecurePass123!");

        // Act
        String response = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract token from response
        String token = objectMapper.readTree(response).get("token").asText();

        // Assert - Validate token
        assertTrue(jwtUtil.validateToken(token), "Generated token should be valid");
        assertEquals("testuser", jwtUtil.getUsernameFromToken(token), "Token should contain correct username");
    }
}
