import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Divider,
    CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userAPI } from '../services/api';
import { User } from '../types';

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email')
        .required('Email is required'),
});

const Profile: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: user?.email || '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError(null);
                await userAPI.updateProfile({ email: values.email });
                setSuccess(true);
            } catch (err) {
                setError('Failed to update profile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
    });

    if (!user) {
        return (
            <Container maxWidth="sm">
                <Typography>Please log in to view your profile</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Profile
                </Typography>
                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Account Information
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">
                                <strong>Username:</strong> {user.username}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">
                                <strong>Roles:</strong> {user.roles.join(', ')}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Update Email
                        </Typography>
                        <form onSubmit={formik.handleSubmit}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                sx={{ mb: 2 }}
                            />
                            {error && (
                                <Typography color="error" sx={{ mb: 2 }}>
                                    {error}
                                </Typography>
                            )}
                            {success && (
                                <Typography color="success.main" sx={{ mb: 2 }}>
                                    Profile updated successfully!
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                Update Profile
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Profile;
