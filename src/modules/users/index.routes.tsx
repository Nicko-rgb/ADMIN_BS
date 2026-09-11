/* eslint-disable react-refresh/only-export-components -- este archivo exporta un Fragment de <Route>, no un componente; es intencional (ver comentario abajo). */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const UserPage = lazy(() => import('./pages/UserPage'));
const Profile = lazy(() => import('./pages/Profile'));

// Rutas propias del módulo users — se insertan como hijas del <Route path="home"> en App.tsx, dentro del mismo <Routes> (mismo criterio que system).
export const usersRoutes = (
    <>
        <Route path='home' element={<Home />} />
        <Route path="home/profile" element={<Profile />} />
        <Route path="users" element={<UserPage />} />
    </>
);
