import type { CountryDisplay } from '../../../shared/interfaces/catalog.interface';

// Roles base gestionables desde la app — mismos que MANAGED_ROLES del backend (roleHierarchy.ts).
export type ManagedRole = 'system' | 'super_admin' | 'administrador' | 'empleado' | 'cliente';

// Roles asignados a sucursales — los únicos que cambian de rol entre sí y eligen sucursales.
export type SucursalRole = 'administrador' | 'empleado';
export type DocumentType = 'IDENTITY_CARD' | 'PASSPORT' | 'LICENSE' | 'OTHER';

// Usuario del catálogo global, con su persona ya resuelta. `role` es la key del rol (puede ser un
// rol creado desde System > Roles, no solo uno base).
export interface UserAdmin {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    country: CountryDisplay | null;
    role: string;
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
    role: string;
    isEnabled: boolean;
    phone: string | null;
    countryId: number | null;
    documentType: DocumentType | null;
    documentNumber: string | null;
    dateBirth: string | null;
}

// Empresa o sucursal a la que está asignado un usuario gestionado.
export interface ManagedUserAssignment {
    tenantId: string;
    name: string;
    role: string;
}

export interface ManagedUserDetail extends UserDetail {
    assignments: ManagedUserAssignment[];
}

// Autoedición del propio perfil — claves iguales a las columnas del modelo. Nunca password, rol ni habilitado.
export interface UpdateOwnProfilePayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string | null;
    country_id?: number;
    document_type?: DocumentType | null;
    document_number?: string | null;
    date_birth?: string | null;
}

// Edición de un usuario gestionado — perfil + habilitado; administrador/empleado además pueden
// cambiar de rol entre sí y de sucursales.
export interface UpdateManagedUserPayload extends UpdateOwnProfilePayload {
    is_enabled?: boolean;
    role?: SucursalRole;
    sucursales?: string[];
}

export type UserFormMode = 'register' | 'edit';

// Estado de FormUserManage — valores tal cual los inputs. `sucursales` en null cuando el contexto no
// gestiona sucursales: el campo no se muestra ni se envía.
export interface UserFormValues {
    first_name: string;
    last_name: string;
    date_birth: string;
    phone: string;
    email: string;
    password: string;
    country_id: number;
    document_type: DocumentType | '';
    document_number: string;
    is_enabled: boolean;
    role: ManagedRole;
    sucursales: string[] | null;
}

// Alta — según el rol, la empresa (super_admin) o las sucursales (administrador/empleado).
export interface CreateManagedUserPayload extends UpdateOwnProfilePayload {
    first_name: string;
    last_name: string;
    phone: string;
    country_id: number;
    password?: string;
    sucursales?: string[];
    company_tenant_id?: string;
}
