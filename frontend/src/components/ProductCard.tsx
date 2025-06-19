import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Product } from '../types';
import { addToCart } from '../store/slices/cartSlice';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const dispatch = useDispatch();

    const handleAddToCart = () => {
        dispatch(addToCart({ product, quantity: 1 }));
    };

    return (
        <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || '/placeholder.png'}
                alt={product.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                        ${product.price.toFixed(2)}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0}
                    >
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
