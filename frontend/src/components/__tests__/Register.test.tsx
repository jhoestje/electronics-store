import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Register } from '../pages/Register';
import { authSlice } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

// Mock the authAPI
jest.mock('../services/api');
const mockedAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authSlice.reducer,
            },
        });
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderRegister = () => {
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            </Provider>
        );
    };

    test('renders registration form with all fields', () => {
        renderRegister();

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('shows validation errors for empty fields', async () => {
        renderRegister();

        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/username is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for invalid email format', async () => {
        renderRegister();

        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for weak password', async () => {
        renderRegister();

        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
        });
    });

    test('shows validation error when passwords do not match', async () => {
        renderRegister();

        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
        fireEvent.blur(confirmPasswordInput);

        await waitFor(() => {
            expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for short username', async () => {
        renderRegister();

        const usernameInput = screen.getByLabelText(/username/i);
        fireEvent.change(usernameInput, { target: { value: 'ab' } });
        fireEvent.blur(usernameInput);

        await waitFor(() => {
            expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for long username', async () => {
        renderRegister();

        const usernameInput = screen.getByLabelText(/username/i);
        fireEvent.change(usernameInput, { target: { value: 'a'.repeat(21) } });
        fireEvent.blur(usernameInput);

        await waitFor(() => {
            expect(screen.getByText(/username must be at most 20 characters/i)).toBeInTheDocument();
        });
    });

    test('successful registration redirects to home', async () => {
        const mockResponse = {
            data: {
                user: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    roles: ['ROLE_CUSTOMER'],
                },
                token: 'jwt-token',
            },
        };

        mockedAuthAPI.register.mockResolvedValue(mockResponse);

        renderRegister();

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockedAuthAPI.register).toHaveBeenCalledWith('testuser', 'test@example.com', 'SecurePass123!');
            expect(mockNavigate).toHaveBeenCalledWith('/');
            expect(localStorage.getItem('token')).toBe('jwt-token');
        });
    });

    test('shows loading state during registration', async () => {
        mockedAuthAPI.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderRegister();

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        // Check loading state
        expect(screen.getByText(/creating your account/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    test('shows error message on registration failure', async () => {
        mockedAuthAPI.register.mockRejectedValue({
            response: {
                data: {
                    error: 'Username already exists',
                },
            },
        });

        renderRegister();

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
        });
    });

    test('shows generic error message on network error', async () => {
        mockedAuthAPI.register.mockRejectedValue(new Error('Network error'));

        renderRegister();

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
        });
    });

    test('has link to login page', () => {
        renderRegister();

        const loginLink = screen.getByText(/sign in here/i);
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    test('disables submit button when loading', async () => {
        mockedAuthAPI.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderRegister();

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'SecurePass123!' } });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        // Button should be disabled during loading
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Creating Account...');
    });
});
