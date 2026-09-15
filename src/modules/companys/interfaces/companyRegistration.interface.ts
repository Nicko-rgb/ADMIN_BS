import type { CreateManagedUserPayload } from '../../users/interfaces/user.interface';

// Paso 1 — datos de la empresa. ubigeo_id es el distrito (nivel 3) final, resuelto por la
// cascada departamento → provincia → distrito, no un campo que el admin tipee directo.
export interface CompanyStepForm {
    name: string;
    document: string;
    country_id: number;
    ubigeo_id: number;
    address: string;
    phone_cell: string;
    phone: string;
}

export type BillingPeriod = 'monthly' | 'yearly';

// Paso 3 — plan elegido y periodicidad de facturación.
export interface PlanStepForm {
    plan_id: number;
    billing_period: BillingPeriod;
}

// Payload de POST /companys/register — mismo shape que valida el backend (registerCompanySchema).
// `owner` sale de toUserPayload (rol super_admin, modo alta).
export interface RegisterCompanyPayload {
    company: CompanyStepForm;
    owner: CreateManagedUserPayload;
    plan: PlanStepForm;
}
