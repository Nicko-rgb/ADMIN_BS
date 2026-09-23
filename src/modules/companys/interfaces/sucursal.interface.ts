import type { CountryDisplay } from '../../../shared/interfaces/catalog.interface';
import type { TenantFormErrors } from '../utils/tenantForm';

export type SucursalStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

// País de la sucursal (toSucursalDto) — con `id` de catálogo para precargar el form.
// A diferencia de la empresa, la sucursal SÍ trae ids (ver BACKEND dto/sucursal.dto.ts).
export interface SucursalCountry extends CountryDisplay {
    id: number;
}

// Ubigeo de la sucursal (toSucursalDto) — con ids de cada nivel para precargar la cascada.
export interface SucursalUbigeo {
    id: number;
    district: string;
    provinceId: number | null;
    department: string | null;
    departmentId: number | null;
    formatted: string;
}

// Detalle de una sucursal — se busca por su propio publicId, nunca ids internos ni tenant.
export interface SucursalDetail {
    publicId: string;
    companyPublicId: string | null;
    name: string;
    address: string;
    phoneCell: string;
    phone: string | null;
    latitude: string | null;
    longitude: string | null;
    description: string | null;
    website: string | null;
    status: SucursalStatus | null;
    country: SucursalCountry | null;
    ubigeo: SucursalUbigeo | null;
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
