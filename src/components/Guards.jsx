import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = () => (useAuth().user ? <Outlet /> : <Navigate to="/login" replace />);
export const GuestRoute = () => (useAuth().user ? <Navigate to="/recipes" replace /> : <Outlet />);
