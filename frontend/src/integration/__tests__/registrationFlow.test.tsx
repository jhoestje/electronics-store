import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Register } from '../../pages/Register';
import { authSlice } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

// Mock the authAPI
jest.mock('../../services/api');
const mockedAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Registration Flow Integration Tests', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authSlice.reducer,
            },
        });
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    const renderRegistrationFlow = () => {
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            </Provider>
        );
    };

    describe('Successful Registration Flow', () => {
        test('complete registration flow from form to API to redirect', async () => {
            // Mock successful API response
            const mockResponse = {
                data: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        roles: ['ROLE_CUSTOMER'],
                    },
                    token: 'jwt-token-12345',
                },
            };
            mockedAuthAPI.register.mockResolvedValue(mockResponse);

            // Render the registration form
            renderRegistrationFlow();

            // Step 1: Fill out the registration form
            const usernameInput = screen.getByLabelText(/username/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = screen.getByLabelText(/^password$/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } });

            // Step 2: Submit the form
            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Step 3: Verify loading state
            expect(screen.getByText(/creating your account/i)).toBeInTheDocument();
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveTextContent('Creating Account...');

            // Step 4: Wait for successful response
            await waitFor(() => {
                expect(mockedAuthAPI.register).toHaveBeenCalledWith(
                    'testuser',
                    'test@example.com',
                    'SecurePass123!'
                );
            });

            // Step 5: Verify Redux state update
            await waitFor(() => {
                const state = store.getState();
                expect(state.auth.user).toEqual({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    roles: ['ROLE_CUSTOMER'],
                });
                expect(state.auth.token).toBe('jwt-token-12345');
                expect(state.auth.isLoading).toBe(false);
                expect(state.auth.error).toBe(null);
            });

            // Step 6: Verify localStorage update
            expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token-12345');

            // Step 7: Verify navigation
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });

        test('first user gets admin role', async () => {
            // Mock successful API response with admin role
            const mockResponse = {
                data: {
                    user: {
                        id: 1,
                        username: 'adminuser',
                        email: 'admin@example.com',
                        roles: ['ROLE_ADMIN'],
                    },
                    token: 'admin-jwt-token',
                },
            };
            mockedAuthAPI.register.mockResolvedValue(mockResponse);

            renderRegistrationFlow();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'adminuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'admin@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'AdminPass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'AdminPass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                const state = store.getState();
                expect(state.auth.user.roles).toContain('ROLE_ADMIN');
            });
        });
    });

    describe('Error Handling Flow', () => {
        test('handles username already exists error', async () => {
            // Mock API error response
            mockedAuthAPI.register.mockRejectedValue({
                response: {
                    data: {
                        error: 'Username already exists',
                    },
                },
            });

            renderRegistrationFlow();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            // Verify error message appears
            await waitFor(() => {
                expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
            });

            // Verify Redux state
            await waitFor(() => {
                const state = store.getState();
                expect(state.auth.error).toBe('Username already exists');
                expect(state.auth.isLoading).toBe(false);
                expect(state.auth.user).toBe(null);
                expect(state.auth.token).toBe(null);
            });

            // Verify button is re-enabled
            expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
        });

        test('handles email already exists error', async () => {
            mockedAuthAPI.register.mockRejectedValue({
                response: {
                    data: {
                        error: 'Email already exists',
                    },
                },
            });

            renderRegistrationFlow();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
            });
        });

        test('handles password validation error', async () => {
            mockedAuthAPI.register.mockRejectedValue({
                response: {
                    data: {
                        error: 'Password does not meet requirements',
                    },
                },
            });

            renderRegistrationFlow();

            // Fill and submit form with weak password
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'weak' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/password does not meet requirements/i)).toBeInTheDocument();
            });
        });

        test('handles network error gracefully', async () => {
            mockedAuthAPI.register.mockRejectedValue(new Error('Network Error'));

            renderRegistrationFlow();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation Integration', () => {
        test('prevents submission with invalid form data', async () => {
            renderRegistrationFlow();

            // Try to submit empty form
            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Verify validation errors appear
            await waitFor(() => {
                expect(screen.getByText(/username is required/i)).toBeInTheDocument();
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
                expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
            });

            // Verify API was not called
            expect(mockedAuthAPI.register).not.toHaveBeenCalled();
        });

        test('prevents submission with mismatched passwords', async () => {
            renderRegistrationFlow();

            // Fill form with mismatched passwords
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
            });

            // Verify API was not called
            expect(mockedAuthAPI.register).not.toHaveBeenCalled();
        });

        test('prevents submission with weak password', async () => {
            renderRegistrationFlow();

            // Fill form with weak password
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'weak' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
            });

            // Verify API was not called
            expect(mockedAuthAPI.register).not.toHaveBeenCalled();
        });
    });

    describe('User Experience Flow', () => {
        test('allows user to retry after error', async () => {
            // First attempt fails
            mockedAuthAPI.register
                .mockRejectedValueOnce({
                    response: {
                        data: { error: 'Username already exists' },
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        user: {
                            id: 2,
                            username: 'newuser',
                            email: 'test@example.com',
                            roles: ['ROLE_CUSTOMER'],
                        },
                        token: 'jwt-token-2',
                    },
                });

            renderRegistrationFlow();

            // First attempt
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
            fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            // Wait for error
            await waitFor(() => {
                expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
            });

            // Clear error and try again with different username
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            // Wait for success
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/');
            });

            // Verify final state
            const state = store.getState();
            expect(state.auth.user.username).toBe('newuser');
        });

        test('maintains form data during submission', async () => {
            // Mock slow API response
            mockedAuthAPI.register.mockImplementation(() => new Promise(resolve => 
                setTimeout(() => resolve({
                    data: {
                        user: {
                            id: 1,
                            username: 'testuser',
                            email: 'test@example.com',
                            roles: ['ROLE_CUSTOMER'],
                        },
                        token: 'jwt-token',
                    },
                }), 100)
            ));

            renderRegistrationFlow();

            // Fill form
            const usernameInput = screen.getByLabelText(/username/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = screen.getByLabelText(/^password$/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } });

            // Submit form
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            // Verify form data is preserved during loading
            expect(usernameInput).toHaveValue('testuser');
            expect(emailInput).toHaveValue('test@example.com');
            expect(passwordInput).toHaveValue('SecurePass123!');
            expect(confirmPasswordInput).toHaveValue('SecurePass123!');

            // Wait for completion
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/');
            });
        });
    });

    describe('Navigation Integration', () => {
        test('login link works correctly', () => {
            renderRegistrationFlow();

            const loginLink = screen.getByText(/sign in here/i);
            expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
        });

        test('does not navigate on validation errors', async () => {
            renderRegistrationFlow();

            // Submit empty form
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/username is required/i)).toBeInTheDocument();
            });

            // Verify no navigation occurred
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
