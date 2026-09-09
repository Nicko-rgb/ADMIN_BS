import type { UserRole, DocumentType } from '../interfaces/user.interface';

export const ROLE_LABELS: Record<UserRole, string> = {
    cliente: 'Cliente',
    empleado: 'Empleado',
    administrador: 'Administrador',
    super_admin: 'Super admin',
    system: 'Sistema',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    IDENTITY_CARD: 'DNI',
    PASSPORT: 'Pasaporte',
    LICENSE: 'Licencia',
    OTHER: 'Otro',
};

export const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
