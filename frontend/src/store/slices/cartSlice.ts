import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../types';

interface CartState {
    items: CartItem[];
    total: number;
}

const initialState: CartState = {
    items: [],
    total: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ product, quantity });
            }
            state.total = state.items.reduce((total, item) => 
                total + (item.product.price * item.quantity), 0);
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.product.id !== action.payload);
            state.total = state.items.reduce((total, item) => 
                total + (item.product.price * item.quantity), 0);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
            const item = state.items.find(item => item.product.id === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
                state.total = state.items.reduce((total, item) => 
                    total + (item.product.price * item.quantity), 0);
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.total = 0;
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
