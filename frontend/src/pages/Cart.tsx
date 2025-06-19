import React from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Box,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';

const Cart: React.FC = () => {
    const dispatch = useDispatch();
    const { items, total } = useSelector((state: RootState) => state.cart);

    const handleUpdateQuantity = (productId: number, currentQuantity: number, delta: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity > 0) {
            dispatch(updateQuantity({ productId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (productId: number) => {
        dispatch(removeFromCart(productId));
    };

    if (items.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Shopping Cart
                </Typography>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography>Your cart is empty</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.product.id}>
                                <TableCell component="th" scope="row">
                                    {item.product.name}
                                </TableCell>
                                <TableCell align="right">
                                    ${item.product.price.toFixed(2)}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.product.id!, item.quantity, -1)}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.product.id!, item.quantity, 1)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveItem(item.product.id!)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Typography variant="h6">Total</Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="h6">${total.toFixed(2)}</Typography>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => {/* TODO: Implement checkout */}}
                >
                    Proceed to Checkout
                </Button>
            </Box>
        </Container>
    );
};

export default Cart;
