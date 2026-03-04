package com.store.electronics.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    @DisplayName("Valid password should pass validation")
    void testValidPassword() {
        String validPassword = "SecurePass123!";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(validPassword);
        
        assertTrue(result.isValid(), "Valid password should pass validation");
        assertNull(result.getErrorMessage(), "Valid password should not have error message");
    }

    @Test
    @DisplayName("Password too short should fail validation")
    void testPasswordTooShort() {
        String shortPassword = "Short1!";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(shortPassword);
        
        assertFalse(result.isValid(), "Short password should fail validation");
        assertTrue(result.getErrorMessage().contains("at least 8 characters long"), 
                  "Should mention minimum length requirement");
    }

    @Test
    @DisplayName("Password without uppercase should fail validation")
    void testPasswordWithoutUppercase() {
        String noUppercase = "lowercase123!";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(noUppercase);
        
        assertFalse(result.isValid(), "Password without uppercase should fail validation");
        assertTrue(result.getErrorMessage().contains("uppercase letter"), 
                  "Should mention uppercase requirement");
    }

    @Test
    @DisplayName("Password without lowercase should fail validation")
    void testPasswordWithoutLowercase() {
        String noLowercase = "UPPERCASE123!";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(noLowercase);
        
        assertFalse(result.isValid(), "Password without lowercase should fail validation");
        assertTrue(result.getErrorMessage().contains("lowercase letter"), 
                  "Should mention lowercase requirement");
    }

    @Test
    @DisplayName("Password without digit should fail validation")
    void testPasswordWithoutDigit() {
        String noDigit = "NoDigitsHere!";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(noDigit);
        
        assertFalse(result.isValid(), "Password without digit should fail validation");
        assertTrue(result.getErrorMessage().contains("at least one digit"), 
                  "Should mention digit requirement");
    }

    @Test
    @DisplayName("Password without special character should fail validation")
    void testPasswordWithoutSpecialChar() {
        String noSpecialChar = "NoSpecialChar123";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(noSpecialChar);
        
        assertFalse(result.isValid(), "Password without special character should fail validation");
        assertTrue(result.getErrorMessage().contains("special character"), 
                  "Should mention special character requirement");
    }

    @Test
    @DisplayName("Multiple validation errors should be reported")
    void testMultipleValidationErrors() {
        String badPassword = "bad";
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(badPassword);
        
        assertFalse(result.isValid(), "Bad password should fail validation");
        String errorMessage = result.getErrorMessage();
        
        // Should mention the first error (length)
        assertTrue(errorMessage.contains("at least 8 characters long"), "Should mention length requirement");
    }

    @Test
    @DisplayName("Null password should fail validation")
    void testNullPassword() {
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword(null);
        
        assertFalse(result.isValid(), "Null password should fail validation");
        assertNotNull(result.getErrorMessage(), "Should have error message for null password");
    }

    @Test
    @DisplayName("Empty password should fail validation")
    void testEmptyPassword() {
        PasswordValidator.ValidationResult result = PasswordValidator.validatePassword("");
        
        assertFalse(result.isValid(), "Empty password should fail validation");
        assertEquals("Password is required", result.getErrorMessage(), "Should return required message");
    }
}
