/* eslint-disable react-refresh/only-export-components -- este archivo exporta un Fragment de <Route>, no un componente; es intencional (ver comentario abajo). */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const MyCompanys = lazy(() => import('./pages/MyCompanys'));
const Bookings = lazy(() => import('./pages/Bookings'));

/**
 * Rutas hijas del módulo de reservas bajo el AppLayout de /bookings.
 */
export const bookingsRoutes = (
    <>
        <Route index element={<MyCompanys />} />
        <Route path="branch/:sucursalPublicId" element={<Bookings />} />
    </>
);
