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

// Usuario asignado a la empresa o a alguna de sus sucursales — todos los roles llegan acá,
// el dueño (super_admin) se extrae en el front filtrando por role.
export interface CompanyUser {
    publicId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    role: ManagedRole;
    documentType: DocumentType | null;
    documentNumber: string | null;
    dateBirth: string | null;
    country: { id: number; name: string; flagUrl: string; phoneCode: string } | null;
    sucursales: { publicId: string; name: string | null }[];
}

// Ubigeo en el detalle — solo el string ya formateado.
export interface CompanyUbigeo {
    formatted: string;
}

// Sucursal en la grilla del detalle.
export interface CompanySubsidiary {
    publicId: string;
    name: string;
    address: string;
    ubigeo: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | null;
}

// Detalle de una empresa — `owner` ya no existe como campo separado;
// el frontend lo extrae de `users` filtrando role === 'super_admin'.
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
