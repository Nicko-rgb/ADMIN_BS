import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

interface ProtectedRouteProps {
    children: ReactNode;
}

// Envuelve cualquier ruta que requiera sesión — sin token, manda a login.
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = useSessionStore((state) => state.token);
    return token ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
