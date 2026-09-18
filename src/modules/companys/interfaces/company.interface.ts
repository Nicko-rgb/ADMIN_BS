import type { CountryDisplay } from '../../../shared/interfaces/catalog.interface';
import type { DocumentType, ManagedRole } from '../../users/interfaces/user.interface';

export type CompanyEnabled = 'A' | 'I' | 'P';

// País con su id crudo — a diferencia de CountryDisplay (solo para mostrar), acá hace falta
// para precargar el select del form de edición (de la empresa o del dueño).
export interface CompanyDetailCountry extends CountryDisplay {
    id: number;
}

// Dueño de la empresa — primer super_admin activo asignado (null si todavía no tiene).
// firstName/lastName separados (no un `name` ya unido) y dateBirth, para poder precargar el
// form de edición sin pedir nada aparte.
export interface CompanyOwner {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    documentType: DocumentType | null;
    documentNumber: string | null;
    dateBirth: string | null;
    country: CompanyDetailCountry | null;
}

// Plan primario de la empresa (null si todavía no tiene suscripción).
export interface CompanyPlan {
    id: number;
    name: string;
    code: string;
    status: string;
}

// Empresa principal del catálogo SaaS, con su dueño y su plan.
export interface CompanyAdmin {
    id: number;
    tenantId: string;
    name: string;
    document: string;
    phoneCell: string;
    website: string | null;
    country: CountryDisplay | null;
    isEnabled: CompanyEnabled | null;
    owner: CompanyOwner | null;
    plan: CompanyPlan | null;
    createdAt: string;
}

// Ubigeo de la empresa ya resuelto con su cadena de padres — distrito, provincia y
// departamento, más el string ya armado para mostrar directo ("Chachapoyas, Chachapoyas, Amazonas").
// Los ids de cada nivel van además de los nombres, para precargar la cascada del form de edición.
export interface CompanyUbigeo {
    id: number;
    district: string;
    province: string | null;
    provinceId: number | null;
    department: string | null;
    departmentId: number | null;
    formatted: string;
}

// Sucursal de la empresa, en la grilla del detalle — lo que muestra la card (nombre, dirección,
// ubigeo ya formateado) y el link a su edición; el detalle completo para editar lo trae
// sucursal.interface.ts aparte.
export interface CompanySubsidiary {
    tenantId: string;
    name: string;
    address: string;
    ubigeo: string | null;
}

// Usuario asignado a la empresa o a alguna de sus sucursales — el dueño no entra acá, viene
// aparte en `owner`. `sucursales` trae una entrada por asignación (puede estar en varias).
export interface CompanyUser {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    role: ManagedRole;
    sucursales: { tenantId: string; name: string | null }[];
}

// Detalle de una empresa (página "Ver empresa") — se busca por tenantId, no por id.
export interface CompanyDetail {
    id: number;
    name: string;
    document: string;
    address: string;
    phoneCell: string;
    phone: string | null;
    isEnabled: CompanyEnabled | null;
    country: CompanyDetailCountry | null;
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
