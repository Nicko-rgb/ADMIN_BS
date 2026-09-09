/* eslint-disable react-refresh/only-export-components -- este archivo exporta un Fragment de <Route>, no un componente; es intencional (ver comentario abajo). */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const CountriesPage = lazy(() => import('./pages/CountriesPage'));
const SportTypesPage = lazy(() => import('./pages/SportTypesPage'));
const SportCategoriesPage = lazy(() => import('./pages/SportCategoriesPage'));
const SurfaceTypesPage = lazy(() => import('./pages/SurfaceTypesPage'));
const PaymentTypesPage = lazy(() => import('./pages/PaymentTypesPage'));
const UbigeoPage = lazy(() => import('./pages/UbigeoPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const MenuManage = lazy(() => import('./pages/MenuManage'))
const PermissionsPage = lazy(() => import('./pages/PermissionsPage'));

/**
 * Rutas propias del módulo system — a diferencia de auth (standalone), estas
 * se insertan como hijas DIRECTAS del <Route path="system/*"> en App.tsx,
 * dentro del mismo <Routes> — así el <Outlet/> de AppLayout las encuentra.
 * Un <Routes> propio acá adentro no funciona: <Routes> solo reconoce
 * <Route>/<Fragment> como hijos, no un componente separado.
 */
export const systemRoutes = (
    <>
        <Route path='menu' element={<MenuManage />} />
        <Route path='permissions' element={<PermissionsPage />} />
        <Route path="catalogs/countries" element={<CountriesPage />} />
        <Route path="catalogs/sport-types" element={<SportTypesPage />} />
        <Route path="catalogs/sport-categories" element={<SportCategoriesPage />} />
        <Route path="catalogs/surface-types" element={<SurfaceTypesPage />} />
        <Route path="catalogs/payment-types" element={<PaymentTypesPage />} />
        <Route path="catalogs/ubigeo" element={<UbigeoPage />} />
        <Route path="catalogs/plans" element={<PlansPage />} />
    </>
);
