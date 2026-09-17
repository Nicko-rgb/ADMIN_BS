import type { CompanyDetailCountry, CompanyUbigeo } from './company.interface';
import type { TenantFormErrors } from '../utils/tenantForm';

export type SucursalStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

// Detalle de una sucursal — se busca por su propio tenantId, no por el de la empresa padre.
export interface SucursalDetail {
    tenantId: string;
    companyTenantId: string | null;
    name: string;
    address: string;
    phoneCell: string;
    phone: string | null;
    latitude: string | null;
    longitude: string | null;
    description: string | null;
    website: string | null;
    status: SucursalStatus | null;
    country: CompanyDetailCountry | null;
    ubigeo: CompanyUbigeo | null;
    createdAt: string;
}

// Estado del form — sirve para alta y edición (mismo formulario, ver useSucursalForm). Lat/long
// como string (valor crudo del input), se convierten a number recién al armar el payload.
export interface SucursalFormData {
    name: string;
    address: string;
    country_id: number;
    ubigeo_id: number;
    phone_cell: string;
    phone: string;
    latitude: string;
    longitude: string;
    description: string;
    website: string;
}

export type SucursalFormErrors = TenantFormErrors<SucursalFormData>;

// Payload de alta/edición — mismo shape que valida el backend (registerSucursalSchema/updateSucursalSchema).
// Sin `document`: la sucursal lo hereda de la empresa padre, no se pide acá.
export interface SucursalPayload {
    name?: string;
    address?: string;
    country_id?: number;
    ubigeo_id?: number;
    phone_cell?: string;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    description?: string | null;
    website?: string | null;
}
