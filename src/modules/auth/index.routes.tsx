import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Rutas propias del módulo auth — se monta en App.tsx dentro de su propio <Routes> anidado.
const AuthRoutes = () => (
    <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
);

export default AuthRoutes;
