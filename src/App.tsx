
import './shared/styles/colors.css';
import './shared/styles/global.css';
import './shared/styles/Button.css'

import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthRoutes from './modules/auth/index.routes';
import { companyRoutes } from './modules/companys/index.routes';
import { systemRoutes } from './modules/system/index.routes';
import { usersRoutes } from './modules/users/index.routes';
import AppLayout from './shared/components/AppLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';
import NotFoundPage from './shared/pages/NotFoundPage';
// Router raíz: monta el router de cada módulo bajo su propio <Routes> anidado.
function App() {
    return (
        <Router>
            <Suspense fallback={<div className="route_loading">Cargando...</div>}>
                <Routes>
                    <Route path="/" element={<Navigate to="/auth/login" replace />} />

                    {/* Ruta aqui de todos los modulos */}
                    <Route path="auth/*" element={<AuthRoutes />} />

                    {/* Área autenticada: sin sesión, ProtectedRoute manda a login */}
                    <Route path="" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>{usersRoutes}</Route>
                    <Route path="companys" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>{companyRoutes}</Route>
                    <Route path="system" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>{systemRoutes}</Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>

            <Toaster
                position="top-right"
                reverseOrder={true}
                toastOptions={{
                    duration: 2000,
                    style: { background: '#363636', color: '#fff', fontSize: 12 },
                    success: { duration: 3000 },
                    error: { duration: 5000 },
                }}
            />
        </Router>
    );
}

export default App;
