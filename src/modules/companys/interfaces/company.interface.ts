import type { CountryDisplay } from '../../../shared/interfaces/catalog.interface';
import type { DocumentType, ManagedRole } from '../../users/interfaces/user.interface';

export type CompanyEnabled = 'A' | 'I' | 'P';

// Dueño en el listado (toCompanyListDto) — solo nombre y email, sin publicId ni persona.
export interface CompanyListOwner {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

// Plan en el listado (toCompanyListDto) — { name, code, status }, sin publicId.
export interface CompanyPlan {
    name: string;
    code: string;
    status: string;
}

// Listado de empresas (toCompanyListDto) — sin `website` (el backend no lo envía acá).
export interface CompanyAdmin {
    publicId: string;
    name: string;
    document: string;
    phoneCell: string;
    country: CountryDisplay | null;
    isEnabled: CompanyEnabled | null;
    owner: CompanyListOwner | null;
    plan: CompanyPlan | null;
    createdAt: string;
}

// País del dueño en el detalle — el único `country` con `id` que envía el backend
// (owner.person.country). El `country` de la empresa NO trae id.
export interface CompanyOwnerCountry extends CountryDisplay {
    id: number;
}

// Dueño en el detalle (toCompanyDetailDto) — con publicId y datos de persona.
export interface CompanyOwner {
    publicId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    documentType: DocumentType | null;
    documentNumber: string | null;
    dateBirth: string | null;
    country: CompanyOwnerCountry | null;
}

// Ubigeo en el detalle (toCompanyDetailDto) — solo el string ya formateado.
export interface CompanyUbigeo {
    formatted: string;
}

// Sucursal en la grilla del detalle — { publicId, name, address, ubigeo } con el ubigeo
// ya formateado como string; el detalle completo para editar vive en sucursal.interface.ts.
export interface CompanySubsidiary {
    publicId: string;
    name: string;
    address: string;
    ubigeo: string | null;
}

// Usuario asignado a la empresa o a alguna de sus sucursales — el dueño no entra acá, viene
// aparte en `owner`. `sucursales` trae una entrada por asignación (puede estar en varias).
export interface CompanyUser {
    publicId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    role: ManagedRole;
    sucursales: { publicId: string; name: string | null }[];
}

// Detalle de una empresa (toCompanyDetailDto) — se busca por publicId, nunca ids internos.
// El `country` de la empresa es solo display (sin id); el detalle no trae `plan`
// (el plan/uso se consulta aparte con usePlanUsage).
export interface CompanyDetail {
    publicId: string;
    name: string;
    document: string;
    address: string;
    phoneCell: string;
    phone: string | null;
    isEnabled: CompanyEnabled | null;
    country: CountryDisplay | null;
    ubigeo: CompanyUbigeo | null;
    owner: CompanyOwner | null;
    subsidiaries: CompanySubsidiary[];
    users: CompanyUser[];
    createdAt: string;
}

// Payload de autoedición de la propia empresa — todo opcional, incluye `document` (RUC) por si
// se cargó mal al registrar; el backend revalida que no choque con el de otra empresa.
export interface UpdateCompanyPayload {
    name?: string;
    document?: string;
    country_id?: number;
    ubigeo_id?: number;
    address?: string;
    phone_cell?: string;
    phone?: string | null;
}
