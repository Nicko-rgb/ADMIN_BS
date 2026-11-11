/* eslint-disable react-refresh/only-export-components -- exporta rutas para montarlas desde App.tsx. */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));

export const saasRoutes = (
    <Route path="suscriptions" element={<SubscriptionsPage />} />
);
