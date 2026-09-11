/* eslint-disable react-refresh/only-export-components -- este archivo exporta un Fragment de <Route>, no un componente; es intencional (ver comentario abajo). */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const CompanysPage = lazy(() => import('./pages/CompanysPage'));
const Company = lazy(() => import('./pages/Company'));
const RegisterCompany = lazy(() => import('./pages/RegisterCompany'));
const SucursalForm = lazy(() => import('./pages/SucursalForm'));


/**
 * Rutas propias del módulo system — a diferencia de auth (standalone), estas
 * se insertan como hijas DIRECTAS del <Route path="system/*"> en App.tsx,
 * dentro del mismo <Routes> — así el <Outlet/> de AppLayout las encuentra.
 * Un <Routes> propio acá adentro no funciona: <Routes> solo reconoce
 * <Route>/<Fragment> como hijos, no un componente separado.
 */
export const companyRoutes = (
    <>
        <Route index element={<CompanysPage />} />
        <Route path="company/:tenantId" element={<Company />} />
        <Route path="company/:tenantId/sucursal/register" element={<SucursalForm />} />
        <Route path="company/:tenantId/sucursal/:sucursalTenantId/edit" element={<SucursalForm />} />
        <Route path="register-company" element={<RegisterCompany />} />
    </>
);
