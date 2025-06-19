import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
    Menu,
    MenuItem,
} from '@mui/material';
import { ShoppingCart, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { items } = useSelector((state: RootState) => state.cart);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleClose();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    Electronics Store
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/cart')}
                    >
                        <Badge badgeContent={items.length} color="error">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>

                    {user ? (
                        <>
                            <IconButton
                                color="inherit"
                                onClick={handleMenu}
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                                    Profile
                                </MenuItem>
                                {user.roles.includes('ROLE_ADMIN') && (
                                    <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
                                        Admin Dashboard
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/register')}>
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
