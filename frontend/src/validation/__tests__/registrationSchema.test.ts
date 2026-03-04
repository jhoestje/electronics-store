import * as yup from 'yup';

// Import the validation schema from Register component
// For testing, we'll recreate it here
const registrationSchema = yup.object({
    username: yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters'),
    email: yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one digit')
        .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

describe('Registration Validation Schema', () => {
    describe('Username Validation', () => {
        test('should accept valid usernames', async () => {
            const validUsernames = ['user', 'testuser', 'user123', 'user_name', 'User123'];
            
            for (const username of validUsernames) {
                await expect(
                    registrationSchema.validateAt('username', { username })
                ).resolves.toBeUndefined();
            }
        });

        test('should reject empty username', async () => {
            await expect(
                registrationSchema.validateAt('username', { username: '' })
            ).rejects.toThrow('Username is required');
        });

        test('should reject short usernames', async () => {
            const shortUsernames = ['ab', 'x', '12'];
            
            for (const username of shortUsernames) {
                await expect(
                    registrationSchema.validateAt('username', { username })
                ).rejects.toThrow('Username must be at least 3 characters');
            }
        });

        test('should reject long usernames', async () => {
            const longUsername = 'a'.repeat(21);
            
            await expect(
                registrationSchema.validateAt('username', { username: longUsername })
            ).rejects.toThrow('Username must be at most 20 characters');
        });

        test('should reject null username', async () => {
            await expect(
                registrationSchema.validateAt('username', { username: null })
            ).rejects.toThrow('Username is required');
        });

        test('should reject undefined username', async () => {
            await expect(
                registrationSchema.validateAt('username', { username: undefined })
            ).rejects.toThrow('Username is required');
        });
    });

    describe('Email Validation', () => {
        test('should accept valid emails', async () => {
            const validEmails = [
                'user@example.com',
                'test.email@domain.co.uk',
                'user123@test-domain.com',
                'user+tag@example.org',
                'user.name@sub.domain.com'
            ];
            
            for (const email of validEmails) {
                await expect(
                    registrationSchema.validateAt('email', { email })
                ).resolves.toBeUndefined();
            }
        });

        test('should reject invalid email formats', async () => {
            const invalidEmails = [
                'invalid-email',
                'user@',
                '@domain.com',
                'user.domain.com',
                'user@domain',
                'user..name@domain.com',
                'user@domain.',
                'user name@domain.com'
            ];
            
            for (const email of invalidEmails) {
                await expect(
                    registrationSchema.validateAt('email', { email })
                ).rejects.toThrow('Invalid email format');
            }
        });

        test('should reject empty email', async () => {
            await expect(
                registrationSchema.validateAt('email', { email: '' })
            ).rejects.toThrow('Email is required');
        });

        test('should reject null email', async () => {
            await expect(
                registrationSchema.validateAt('email', { email: null })
            ).rejects.toThrow('Email is required');
        });

        test('should reject undefined email', async () => {
            await expect(
                registrationSchema.validateAt('email', { email: undefined })
            ).rejects.toThrow('Email is required');
        });
    });

    describe('Password Validation', () => {
        test('should accept valid passwords', async () => {
            const validPasswords = [
                'SecurePass123!',
                'MyPassword1@',
                'Test123#Password',
                'Valid$Pass456',
                'ComplexPass789*'
            ];
            
            for (const password of validPasswords) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).resolves.toBeUndefined();
            }
        });

        test('should reject short passwords', async () => {
            const shortPasswords = ['Short1!', 'Pass1!', '12345'];
            
            for (const password of shortPasswords) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).rejects.toThrow('Password must be at least 8 characters');
            }
        });

        test('should reject passwords without uppercase', async () => {
            const noUppercase = ['lowercase123!', 'alllowercase1', 'noupper123$'];
            
            for (const password of noUppercase) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).rejects.toThrow('Password must contain at least one uppercase letter');
            }
        });

        test('should reject passwords without lowercase', async () => {
            const noLowercase = ['UPPERCASE123!', 'ALLUPPER1', 'NOLOWER123$'];
            
            for (const password of noLowercase) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).rejects.toThrow('Password must contain at least one lowercase letter');
            }
        });

        test('should reject passwords without digits', async () => {
            const noDigits = ['NoDigitsHere!', 'PasswordOnly', 'NoNumbers!'];
            
            for (const password of noDigits) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).rejects.toThrow('Password must contain at least one digit');
            }
        });

        test('should reject passwords without special characters', async () => {
            const noSpecialChars = ['NoSpecialChar123', 'PasswordOnly123', 'JustLettersAndNumbers'];
            
            for (const password of noSpecialChars) {
                await expect(
                    registrationSchema.validateAt('password', { password })
                ).rejects.toThrow('Password must contain at least one special character');
            }
        });

        test('should reject empty password', async () => {
            await expect(
                registrationSchema.validateAt('password', { password: '' })
            ).rejects.toThrow('Password is required');
        });

        test('should reject null password', async () => {
            await expect(
                registrationSchema.validateAt('password', { password: null })
            ).rejects.toThrow('Password is required');
        });

        test('should reject undefined password', async () => {
            await expect(
                registrationSchema.validateAt('password', { password: undefined })
            ).rejects.toThrow('Password is required');
        });
    });

    describe('Confirm Password Validation', () => {
        test('should accept matching passwords', async () => {
            const validData = {
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!'
            };
            
            await expect(
                registrationSchema.validateAt('confirmPassword', validData)
            ).resolves.toBeUndefined();
        });

        test('should reject non-matching passwords', async () => {
            const invalidData = {
                password: 'SecurePass123!',
                confirmPassword: 'DifferentPass123!'
            };
            
            await expect(
                registrationSchema.validateAt('confirmPassword', invalidData)
            ).rejects.toThrow('Passwords must match');
        });

        test('should reject empty confirm password', async () => {
            const data = {
                password: 'SecurePass123!',
                confirmPassword: ''
            };
            
            await expect(
                registrationSchema.validateAt('confirmPassword', data)
            ).rejects.toThrow('Please confirm your password');
        });

        test('should reject null confirm password', async () => {
            const data = {
                password: 'SecurePass123!',
                confirmPassword: null
            };
            
            await expect(
                registrationSchema.validateAt('confirmPassword', data)
            ).rejects.toThrow('Please confirm your password');
        });

        test('should reject undefined confirm password', async () => {
            const data = {
                password: 'SecurePass123!',
                confirmPassword: undefined
            };
            
            await expect(
                registrationSchema.validateAt('confirmPassword', data)
            ).rejects.toThrow('Please confirm your password');
        });
    });

    describe('Complete Form Validation', () => {
        test('should accept complete valid form', async () => {
            const validForm = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!'
            };
            
            await expect(
                registrationSchema.validate(validForm)
            ).resolves.toEqual(validForm);
        });

        test('should reject form with multiple errors', async () => {
            const invalidForm = {
                username: 'ab', // Too short
                email: 'invalid-email', // Invalid format
                password: 'weak', // Too short, missing complexity
                confirmPassword: 'different' // Doesn't match
            };
            
            await expect(
                registrationSchema.validate(invalidForm)
            ).rejects.toThrow();
        });

        test('should provide all error messages for invalid form', async () => {
            const invalidForm = {
                username: 'ab',
                email: 'invalid-email',
                password: 'weak',
                confirmPassword: 'different'
            };
            
            try {
                await registrationSchema.validate(invalidForm);
            } catch (errors) {
                expect(errors.errors).toContain('Username must be at least 3 characters');
                expect(errors.errors).toContain('Invalid email format');
                expect(errors.errors).toContain('Password must be at least 8 characters');
                expect(errors.errors).toContain('Passwords must match');
            }
        });
    });

    describe('Edge Cases', () => {
        test('should handle whitespace in username', async () => {
            const usernameWithSpaces = ' user ';
            
            await expect(
                registrationSchema.validateAt('username', { username: usernameWithSpaces })
            ).resolves.toBeUndefined(); // Yup doesn't trim by default
        });

        test('should handle special characters in username', async () => {
            const usernameWithSpecial = 'user@123';
            
            await expect(
                registrationSchema.validateAt('username', { username: usernameWithSpecial })
            ).resolves.toBeUndefined(); // Only length restrictions apply
        });

        test('should handle complex special characters in password', async () => {
            const complexPassword = 'Password123!@#$%^&*()';
            
            await expect(
                registrationSchema.validateAt('password', { password: complexPassword })
            ).resolves.toBeUndefined();
        });

        test('should handle email with numbers and subdomains', async () => {
            const complexEmail = 'user123@sub.domain.co.uk';
            
            await expect(
                registrationSchema.validateAt('email', { email: complexEmail })
            ).resolves.toBeUndefined();
        });
    });
});
