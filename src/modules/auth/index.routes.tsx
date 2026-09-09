import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/LoginPage'));

// Rutas propias del módulo auth — se monta en App.tsx dentro de su propio <Routes> anidado.
const AuthRoutes = () => (
    <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
);

export default AuthRoutes;
