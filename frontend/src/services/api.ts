import axios from 'axios';
import { Product, User } from '../types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    register: (username: string, email: string, password: string) =>
        api.post('/auth/register', { username, email, password }),
};

// Direct export of auth functions for easier use
export const login = async (credentials: { username: string, password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData: { username: string, email: string, password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const productAPI = {
    getAll: () => api.get<Product[]>('/products'),
    getById: (id: number) => api.get<Product>(`/products/${id}`),
    create: (product: Product) => api.post<Product>('/products', product),
    update: (id: number, product: Product) => api.put<Product>(`/products/${id}`, product),
    delete: (id: number) => api.delete(`/products/${id}`),
    getByCategory: (category: string) => api.get<Product[]>(`/products/category/${category}`),
    getByBrand: (brand: string) => api.get<Product[]>(`/products/brand/${brand}`),
};

export const userAPI = {
    getProfile: () => api.get<User>('/users/profile'),
    updateProfile: (user: Partial<User>) => api.put<User>('/users/profile', user),
};

export default api;
