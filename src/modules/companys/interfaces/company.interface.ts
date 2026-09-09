import type { CountryDisplay } from '../../../shared/interfaces/country.interface';

export type CompanyEnabled = 'A' | 'I' | 'P';

// Dueño de la empresa — primer super_admin activo asignado (null si todavía no tiene).
export interface CompanyOwner {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
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
