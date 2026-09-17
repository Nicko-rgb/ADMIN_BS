import type { DocumentType, ManagedRole } from '../interfaces/user.interface';

// Permiso que exige gestionar un usuario de cada rol — mismo mapa que roleHierarchy.ts del backend.
// Solo decide qué acciones se muestran; la validación real (jerarquía y alcance) la hace el backend.
export const ROLE_MANAGE_PERMISSIONS: Record<ManagedRole, string> = {
    system: 'system.full_access',
    super_admin: 'user.manage_all',
    administrador: 'user.administrator_manage',
    empleado: 'user.employee_manage',
    cliente: 'user.client_manage',
};

export const isManagedRole = (role: string): role is ManagedRole =>
    Object.prototype.hasOwnProperty.call(ROLE_MANAGE_PERMISSIONS, role);

// Etiqueta visible de cada rol — para mostrar sin depender del catálogo del backend (useCatalogActive).
export const ROLE_LABELS: Record<ManagedRole, string> = {
    system: 'Sistema',
    super_admin: 'Dueño',
    administrador: 'Administrador',
    empleado: 'Empleado',
    cliente: 'Cliente',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    IDENTITY_CARD: 'DNI',
    PASSPORT: 'Pasaporte',
    LICENSE: 'Licencia',
    OTHER: 'Otro',
};

export const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
