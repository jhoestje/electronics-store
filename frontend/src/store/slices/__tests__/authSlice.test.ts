import authSlice, { 
    registerStart, 
    registerSuccess, 
    registerFailure, 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    logout 
} from '../authSlice';
import { User } from '../../types';

describe('authSlice', () => {
    const initialState = {
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
        error: null,
    };

    beforeEach(() => {
        localStorage.clear();
    });

    describe('Registration Actions', () => {
        test('registerStart should set loading to true and clear error', () => {
            const state = authSlice.reducer(initialState, registerStart());
            
            expect(state.isLoading).toBe(true);
            expect(state.error).toBe(null);
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
        });

        test('registerSuccess should set user and token', () => {
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            const token = 'jwt-token';
            
            const state = authSlice.reducer(
                initialState, 
                registerSuccess({ user: mockUser, token })
            );
            
            expect(state.isLoading).toBe(false);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(token);
            expect(state.error).toBe(null);
            expect(localStorage.getItem('token')).toBe(token);
        });

        test('registerFailure should set error message', () => {
            const errorMessage = 'Username already exists';
            
            const state = authSlice.reducer(
                initialState, 
                registerFailure(errorMessage)
            );
            
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
        });
    });

    describe('Login Actions', () => {
        test('loginStart should set loading to true and clear error', () => {
            const state = authSlice.reducer(initialState, loginStart());
            
            expect(state.isLoading).toBe(true);
            expect(state.error).toBe(null);
            expect(state.user).toBe(null);
        });

        test('loginSuccess should set user and token', () => {
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            const token = 'jwt-token';
            
            const state = authSlice.reducer(
                initialState, 
                loginSuccess({ user: mockUser, token })
            );
            
            expect(state.isLoading).toBe(false);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(token);
            expect(state.error).toBe(null);
            expect(localStorage.getItem('token')).toBe(token);
        });

        test('loginFailure should set error message', () => {
            const errorMessage = 'Invalid credentials';
            
            const state = authSlice.reducer(
                initialState, 
                loginFailure(errorMessage)
            );
            
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
        });
    });

    describe('Logout Action', () => {
        test('logout should clear user and token', () => {
            // Set up logged in state
            const loggedInState = {
                user: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    roles: ['ROLE_CUSTOMER'],
                },
                token: 'jwt-token',
                isLoading: false,
                error: null,
            };
            
            // Set token in localStorage
            localStorage.setItem('token', 'jwt-token');
            
            const state = authSlice.reducer(loggedInState, logout());
            
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
            expect(localStorage.getItem('token')).toBe(null);
        });
    });

    describe('State Persistence', () => {
        test('should initialize with token from localStorage', () => {
            localStorage.setItem('token', 'existing-token');
            
            const state = authSlice.reducer(undefined, { type: 'unknown' });
            
            expect(state.token).toBe('existing-token');
            expect(state.user).toBe(null);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        test('should handle empty localStorage', () => {
            const state = authSlice.reducer(undefined, { type: 'unknown' });
            
            expect(state.token).toBe(null);
            expect(state.user).toBe(null);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });
    });

    describe('Complex Scenarios', () => {
        test('should handle registration flow: start -> success', () => {
            let state = authSlice.reducer(initialState, registerStart());
            expect(state.isLoading).toBe(true);
            
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            
            state = authSlice.reducer(state, registerSuccess({ user: mockUser, token: 'jwt-token' }));
            expect(state.isLoading).toBe(false);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe('jwt-token');
            expect(state.error).toBe(null);
        });

        test('should handle registration flow: start -> failure', () => {
            let state = authSlice.reducer(initialState, registerStart());
            expect(state.isLoading).toBe(true);
            
            state = authSlice.reducer(state, registerFailure('Username already exists'));
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('Username already exists');
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
        });

        test('should handle login after registration failure', () => {
            // Registration fails
            let state = authSlice.reducer(initialState, registerStart());
            state = authSlice.reducer(state, registerFailure('Username exists'));
            expect(state.error).toBe('Username exists');
            
            // Login succeeds
            state = authSlice.reducer(state, loginStart());
            expect(state.isLoading).toBe(true);
            expect(state.error).toBe(null); // Error should be cleared
            
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            
            state = authSlice.reducer(state, loginSuccess({ user: mockUser, token: 'jwt-token' }));
            expect(state.isLoading).toBe(false);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe('jwt-token');
            expect(state.error).toBe(null);
        });

        test('should handle logout after login', () => {
            // Login succeeds
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            
            let state = authSlice.reducer(
                initialState, 
                loginSuccess({ user: mockUser, token: 'jwt-token' })
            );
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe('jwt-token');
            
            // Logout
            state = authSlice.reducer(state, logout());
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty error message in failure actions', () => {
            const state = authSlice.reducer(initialState, registerFailure(''));
            
            expect(state.error).toBe('');
            expect(state.isLoading).toBe(false);
        });

        test('should handle null user in success actions', () => {
            const state = authSlice.reducer(
                initialState, 
                registerSuccess({ user: null as any, token: 'jwt-token' })
            );
            
            expect(state.user).toBe(null);
            expect(state.token).toBe('jwt-token');
        });

        test('should handle empty token in success actions', () => {
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                roles: ['ROLE_CUSTOMER'],
            };
            
            const state = authSlice.reducer(
                initialState, 
                registerSuccess({ user: mockUser, token: '' })
            );
            
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe('');
            expect(localStorage.getItem('token')).toBe('');
        });
    });
});
