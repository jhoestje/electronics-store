import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { authAPI } from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';

const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
});

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            dispatch(loginStart());
            try {
                const response = await authAPI.login(values.username, values.password);
                dispatch(loginSuccess(response.data));
                navigate('/');
            } catch (error) {
                dispatch(loginFailure('Invalid username or password'));
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Login
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="username"
                            name="username"
                            label="Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Login
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
