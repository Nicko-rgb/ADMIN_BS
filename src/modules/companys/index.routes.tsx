/* eslint-disable react-refresh/only-export-components -- este archivo exporta un Fragment de <Route>, no un componente; es intencional (ver comentario abajo). */
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const CompanysPage = lazy(() => import('./pages/CompanysPage'));
const Company = lazy(() => import('./pages/Company'));
const RegisterCompany = lazy(() => import('./pages/RegisterCompany'));
const Sucursal = lazy(() => import('./pages/Sucursal'));


/**
 * Rutas del modulo company
 * BASE: /companys/
 */
export const companyRoutes = (
    <>
        <Route index element={<CompanysPage />} />
        <Route path="company/:publicId" element={<Company />} />
        <Route path="register-company" element={<RegisterCompany />} />
        <Route path='company/sucursal/:publicId' element={<Sucursal />} />
    </>
);
