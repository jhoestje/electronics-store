export interface User {
    id?: number;
    username: string;
    email: string;
    roles: string[];
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    stockQuantity: number;
    category: string;
    brand: string;
    active: boolean;
}

export interface Order {
    id?: number;
    user?: User;
    orderItems: OrderItem[];
    orderDate: string;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export interface OrderItem {
    id?: number;
    product: Product;
    quantity: number;
    priceAtPurchase: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
