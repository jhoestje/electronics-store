import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Product } from '../../types';
import { productAPI } from '../../services/api';

const validationSchema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
    price: yup.number().positive('Price must be positive').required('Price is required'),
    stockQuantity: yup.number().integer('Must be an integer').min(0).required('Stock quantity is required'),
    category: yup.string().required('Category is required'),
    brand: yup.string().required('Brand is required'),
});

const Dashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: 0,
            stockQuantity: 0,
            category: '',
            brand: '',
            imageUrl: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                if (selectedProduct) {
                    await productAPI.update(selectedProduct.id!, values);
                } else {
                    await productAPI.create(values);
                }
                await fetchProducts();
                handleClose();
            } catch (error) {
                console.error('Failed to save product:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    const handleOpen = (product?: Product) => {
        if (product) {
            setSelectedProduct(product);
            formik.setValues({
                name: product.name,
                description: product.description,
                price: product.price,
                stockQuantity: product.stockQuantity,
                category: product.category,
                brand: product.brand,
                imageUrl: product.imageUrl || '',
            });
        } else {
            setSelectedProduct(null);
            formik.resetForm();
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedProduct(null);
        formik.resetForm();
    };

    const handleDelete = async (id: number) => {
        try {
            await productAPI.delete(id);
            await fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Products Management</Typography>
                            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                                Add New Product
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Brand</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Stock</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.brand}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                                            <TableCell align="right">{product.stockQuantity}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleOpen(product)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(product.id!)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="description"
                                    label="Description"
                                    multiline
                                    rows={4}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    name="price"
                                    label="Price"
                                    type="number"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    error={formik.touched.price && Boolean(formik.errors.price)}
                                    helperText={formik.touched.price && formik.errors.price}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    name="stockQuantity"
                                    label="Stock Quantity"
                                    type="number"
                                    value={formik.values.stockQuantity}
                                    onChange={formik.handleChange}
                                    error={formik.touched.stockQuantity && Boolean(formik.errors.stockQuantity)}
                                    helperText={formik.touched.stockQuantity && formik.errors.stockQuantity}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    name="category"
                                    label="Category"
                                    value={formik.values.category}
                                    onChange={formik.handleChange}
                                    error={formik.touched.category && Boolean(formik.errors.category)}
                                    helperText={formik.touched.category && formik.errors.category}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    name="brand"
                                    label="Brand"
                                    value={formik.values.brand}
                                    onChange={formik.handleChange}
                                    error={formik.touched.brand && Boolean(formik.errors.brand)}
                                    helperText={formik.touched.brand && formik.errors.brand}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="imageUrl"
                                    label="Image URL"
                                    value={formik.values.imageUrl}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
