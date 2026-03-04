package com.store.electronics.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=testSecretKeyForTestingPurposesOnly12345678901234567890123456789012345678901234567890",
    "jwt.expiration=86400000"
})
class JwtUtilIntegrationTest {

    @Autowired
    private JwtUtil jwtUtil;
    
    private String testUsername;
    private List<String> testRoles;

    @BeforeEach
    void setUp() {
        testUsername = "testuser";
        testRoles = List.of("ROLE_CUSTOMER", "ROLE_ADMIN");
    }

    @Test
    @DisplayName("Generated token should contain correct username and roles")
    void testGenerateToken() {
        // Act
        String token = jwtUtil.generateToken(testUsername, testRoles);

        // Assert
        assertNotNull(token, "Token should not be null");
        assertFalse(token.isEmpty(), "Token should not be empty");
        
        // Verify token can be parsed
        String extractedUsername = jwtUtil.getUsernameFromToken(token);
        List<String> extractedRoles = jwtUtil.getRolesFromToken(token);
        assertEquals(testUsername, extractedUsername, "Username should match");
        assertEquals(testRoles, extractedRoles, "Roles should match");
    }

    @Test
    @DisplayName("Extract username from valid token should return correct username")
    void testExtractUsername() {
        // Arrange
        String token = jwtUtil.generateToken(testUsername, testRoles);

        // Act
        String extractedUsername = jwtUtil.getUsernameFromToken(token);

        // Assert
        assertEquals(testUsername, extractedUsername, "Extracted username should match");
    }

    @Test
    @DisplayName("Extract roles from valid token should return correct roles")
    void testExtractRoles() {
        // Arrange
        String token = jwtUtil.generateToken(testUsername, testRoles);

        // Act
        List<String> extractedRoles = jwtUtil.getRolesFromToken(token);

        // Assert
        assertEquals(testRoles, extractedRoles, "Extracted roles should match");
    }

    @Test
    @DisplayName("Token validation should return true for valid token")
    void testValidateToken() {
        // Arrange
        String token = jwtUtil.generateToken(testUsername, testRoles);

        // Act
        boolean isValid = jwtUtil.validateToken(token);

        // Assert
        assertTrue(isValid, "Valid token should pass validation");
    }

    @Test
    @DisplayName("Token validation should return false for invalid token")
    void testValidateInvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.here";

        // Act
        boolean isValid = jwtUtil.validateToken(invalidToken);

        // Assert
        assertFalse(isValid, "Invalid token should fail validation");
    }

    @Test
    @DisplayName("Token validation should return false for null token")
    void testValidateNullToken() {
        // Act
        boolean isValid = jwtUtil.validateToken(null);

        // Assert
        assertFalse(isValid, "Null token should fail validation");
    }

    @Test
    @DisplayName("Token validation should return false for empty token")
    void testValidateEmptyToken() {
        // Act
        boolean isValid = jwtUtil.validateToken("");

        // Assert
        assertFalse(isValid, "Empty token should fail validation");
    }

    @Test
    @DisplayName("Invalid token should fail validation")
    void testParseInvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.here";

        // Act & Assert
        assertFalse(jwtUtil.validateToken(invalidToken), "Invalid token should fail validation");
    }

    @Test
    @DisplayName("Token should support empty roles list")
    void testTokenWithEmptyRoles() {
        // Arrange
        List<String> emptyRoles = List.of();

        // Act
        String token = jwtUtil.generateToken(testUsername, emptyRoles);
        List<String> extractedRoles = jwtUtil.getRolesFromToken(token);

        // Assert
        assertNotNull(token, "Token should not be null");
        assertEquals(emptyRoles, extractedRoles, "Empty roles should be preserved");
    }
}
