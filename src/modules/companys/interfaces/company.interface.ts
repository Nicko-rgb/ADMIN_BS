import type { CountryDisplay } from '../../../shared/interfaces/country.interface';
import type { DocumentType } from '../../users/interfaces/user.interface';

export type CompanyEnabled = 'A' | 'I' | 'P';

// Dueño de la empresa — primer super_admin activo asignado (null si todavía no tiene).
export interface CompanyOwner {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    documentType: DocumentType | null;
    documentNumber: string | null;
    country: CountryDisplay | null;
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
export interface CompanyUbigeo {
    district: string;
    province: string | null;
    department: string | null;
    formatted: string;
}

// Sucursal de la empresa — hoy solo se muestra el nombre, la vista de detalle de sucursal no existe todavía.
export interface CompanySubsidiary {
    name: string;
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
    country: CountryDisplay | null;
    ubigeo: CompanyUbigeo | null;
    owner: CompanyOwner | null;
    subsidiaries: CompanySubsidiary[];
    createdAt: string;
}
