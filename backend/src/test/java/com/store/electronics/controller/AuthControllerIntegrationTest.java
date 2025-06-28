package com.store.electronics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.electronics.dto.AuthRequest;
import com.store.electronics.dto.RegisterRequest;
import com.store.electronics.model.User;
import com.store.electronics.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    public void setup() {
        // Clean up users before each test
        userRepository.deleteAll();
    }

    @Test
    public void testSuccessfulRegistration() throws Exception {
        // When I send a POST request to "/auth/register" with valid data
        RegisterRequest request = new RegisterRequest();
        request.setUsername("johnsmith");
        request.setEmail("johnsmith@email.com");
        request.setPassword("Password123!");

        // Then the response status code should be 200
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                // And the response should contain a field "token"
                .andExpect(jsonPath("$.token").exists())
                // And the response should contain a user with username
                .andExpect(jsonPath("$.user.username").value("johnsmith"))
                // And the response should contain a user with email
                .andExpect(jsonPath("$.user.email").value("johnsmith@email.com"))
                .andReturn();

        // Verify the user was created in the database
        Optional<User> createdUser = userRepository.findByUsername("johnsmith");
        assertTrue(createdUser.isPresent());
        assertEquals("johnsmith@email.com", createdUser.get().getEmail());
    }

    @Test
    public void testCannotRegisterWithExistingUsername() throws Exception {
        // Given a user exists with username "existinguser" and email "existing@email.com"
        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setEmail("existing@email.com");
        existingUser.setPassword("hashedPassword");
        existingUser.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));
        userRepository.save(existingUser);

        // When I send a POST request with an existing username
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setEmail("newuser@email.com");
        request.setPassword("Password123!");

        // Then the response status code should be 400
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                // And the response should contain error "Username already exists"
                .andExpect(jsonPath("$.error").value("Username already exists"));
    }

    @Test
    public void testCannotRegisterWithExistingEmail() throws Exception {
        // Given a user exists with username "existinguser" and email "existing@email.com"
        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setEmail("existing@email.com");
        existingUser.setPassword("hashedPassword");
        existingUser.setRoles(new HashSet<>(Collections.singletonList("ROLE_CUSTOMER")));
        userRepository.save(existingUser);

        // When I send a POST request with an existing email
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newusername");
        request.setEmail("existing@email.com");
        request.setPassword("Password123!");

        // Then the response status code should be 400
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                // And the response should contain error "Email already exists"
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    public void testCannotRegisterWithMissingRequiredFields() throws Exception {
        // When I send a POST request with missing required fields
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        // Missing email field
        request.setPassword("Password123!");

        // Then the response status code should be 400
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testNewlyRegisteredUserCanLogin() throws Exception {
        // Given I successfully registered a user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("newuser@mail.com");
        registerRequest.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // When I send a POST request to "/auth/login" with correct credentials
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setUsername("newuser");
        loginRequest.setPassword("SecurePass123!");

        // Then the response status code should be 200
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                // And the response should contain a field "token"
                .andExpect(jsonPath("$.token").exists())
                // And the response should contain a user with username
                .andExpect(jsonPath("$.user.username").value("newuser"));
    }

    @Test
    public void testRegistrationWithVariousPasswordStrengths() throws Exception {
        // Test strong password (should pass)
        RegisterRequest strongRequest = new RegisterRequest();
        strongRequest.setUsername("strongpass");
        strongRequest.setEmail("strong@example.com");
        strongRequest.setPassword("P@ssw0rd123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(strongRequest)))
                .andExpect(status().isOk());

        // Test weak password - no uppercase (should fail)
        RegisterRequest weakRequest1 = new RegisterRequest();
        weakRequest1.setUsername("weakpass1");
        weakRequest1.setEmail("weak1@example.com");
        weakRequest1.setPassword("password");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(weakRequest1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        // Test weak password - too short (should fail)
        RegisterRequest weakRequest2 = new RegisterRequest();
        weakRequest2.setUsername("weakpass2");
        weakRequest2.setEmail("weak2@example.com");
        weakRequest2.setPassword("12345");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(weakRequest2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testRegistrationCreatesCustomerRoleByDefault() throws Exception {
        // First create an admin user (the system makes the first user an admin)
        RegisterRequest firstRequest = new RegisterRequest();
        firstRequest.setUsername("firstuser");
        firstRequest.setEmail("first@example.com");
        firstRequest.setPassword("First123!");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isOk());
        
        // When I send a POST request with valid data for a second user
        RegisterRequest request = new RegisterRequest();
        request.setUsername("normaluser");
        request.setEmail("normaluser@email.com");
        request.setPassword("Password123!");

        // Then the response status code should be 200 and the user should be a CUSTOMER
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.roles[0]").value("ROLE_CUSTOMER"));

        // Verify the second user was created with ROLE_CUSTOMER in the database
        Optional<User> createdUser = userRepository.findByUsername("normaluser");
        assertTrue(createdUser.isPresent());
        assertTrue(createdUser.get().getRoles().contains("ROLE_CUSTOMER"));
    }
}
