import type { DocumentType } from '../../users/interfaces/user.interface';

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
    website: string;
}

// Paso 2 — datos del dueño (nuevo usuario, rol super_admin). A diferencia de la edición de
// usuario, acá sí lleva password — es un alta, no existe la cuenta todavía.
export interface OwnerStepForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    country_id: number;
    document_type: DocumentType | '';
    document_number: string;
    date_birth: string;
}

export type BillingPeriod = 'monthly' | 'yearly';

// Paso 3 — plan elegido y periodicidad de facturación.
export interface PlanStepForm {
    plan_id: number;
    billing_period: BillingPeriod;
}

// Payload de POST /companys/register — mismo shape que valida el backend (registerCompanySchema).
// document_type ya no puede ser '' acá: isOwnerStepValid garantiza que esté cargado antes de
// llegar al paso 3, donde se arma este payload.
export interface RegisterCompanyPayload {
    company: CompanyStepForm;
    owner: Omit<OwnerStepForm, 'document_type'> & { document_type: DocumentType };
    plan: PlanStepForm;
}
