import type { CountryDisplay } from '../../../shared/interfaces/country.interface';

export type UserRole = 'cliente' | 'empleado' | 'administrador' | 'super_admin' | 'system';
export type DocumentType = 'IDENTITY_CARD' | 'PASSPORT' | 'LICENSE' | 'OTHER';

// Usuario del sistema, con su persona (teléfono, país, documento) ya resuelta.
export interface UserAdmin {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    country: CountryDisplay | null;
    role: UserRole;
    isEnabled: boolean;
    documentType: DocumentType | null;
    documentNumber: string | null;
}

// Detalle completo de un usuario — countryId crudo (para el value del select del form de edición).
export interface UserDetail {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: UserRole;
    isEnabled: boolean;
    phone: string | null;
    countryId: number | null;
    documentType: DocumentType | null;
    documentNumber: string | null;
    dateBirth: string | null;
}

// Payload de edición — claves iguales a las columnas del modelo (contrato de escritura del backend). Nunca incluye password.
export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: UserRole;
    is_enabled?: boolean;
    phone?: string | null;
    country_id?: number;
    document_type?: DocumentType | null;
    document_number?: string | null;
    date_birth?: string | null;
}

// Autoedición del propio perfil — igual a UpdateUserPayload sin `role` ni `is_enabled` (administrativos, nunca los toca el propio usuario).
export type UpdateOwnProfilePayload = Omit<UpdateUserPayload, 'role' | 'is_enabled'>;
