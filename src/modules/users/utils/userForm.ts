import type {
    CreateManagedUserPayload, ManagedRole, ManagedUserDetail, SucursalRole, UpdateManagedUserPayload, UserFormMode, UserFormValues,
} from '../interfaces/user.interface';

const SUCURSAL_ROLES: readonly SucursalRole[] = ['administrador', 'empleado'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isSucursalRole = (role: string): role is SucursalRole => SUCURSAL_ROLES.includes(role as SucursalRole);

export type UserFormFields = Partial<Record<keyof UserFormValues, { required: boolean }>>;

/**
 * Campos visibles del formulario y si son obligatorios, según el rol y el modo — alineado con
 * userManage.schema.ts del backend. Un campo ausente no se muestra ni se valida.
 *   - Roles con acceso al panel (todos menos cliente): correo, contraseña y documento obligatorios.
 *   - Contraseña solo en alta; habilitado solo en edición.
 *   - administrador/empleado: rol, y sucursales si el contexto las gestiona (values.sucursales !== null).
 */
export const getUserFormFields = (role: ManagedRole, mode: UserFormMode, values: UserFormValues): UserFormFields => {
    const panelAccess = role !== 'cliente';
    const sucursalRole = isSucursalRole(role);

    return {
        first_name: { required: true },
        last_name: { required: true },
        date_birth: { required: false },
        phone: { required: true },
        email: { required: panelAccess },
        ...(mode === 'register' ? { password: { required: panelAccess } } : {}),
        country_id: { required: true },
        document_type: { required: panelAccess },
        document_number: { required: panelAccess },
        ...(mode === 'edit' ? { is_enabled: { required: false } } : {}),
        ...(sucursalRole ? { role: { required: true } } : {}),
        ...(sucursalRole && values.sucursales !== null ? { sucursales: { required: true } } : {}),
    };
};

// Formulario vacío para dar de alta un usuario con `role`.
export const createEmptyUserForm = (role: ManagedRole): UserFormValues => ({
    first_name: '',
    last_name: '',
    date_birth: '',
    phone: '',
    email: '',
    password: '',
    country_id: 0,
    document_type: '',
    document_number: '',
    is_enabled: true,
    role,
    sucursales: isSucursalRole(role) ? [] : null,
});

// Formulario de edición precargado con el detalle — `manageSucursales` indica si el contexto
// permite editar sus sucursales.
export const userFormFromDetail = (role: ManagedRole, detail: ManagedUserDetail, manageSucursales: boolean): UserFormValues => ({
    first_name: detail.firstName ?? '',
    last_name: detail.lastName ?? '',
    date_birth: detail.dateBirth ?? '',
    phone: detail.phone ?? '',
    email: detail.email ?? '',
    password: '',
    country_id: detail.countryId ?? 0,
    document_type: detail.documentType ?? '',
    document_number: detail.documentNumber ?? '',
    is_enabled: detail.isEnabled,
    role,
    sucursales: isSucursalRole(role) && manageSucursales ? detail.assignments.map((assignment) => assignment.tenantId) : null,
});

const isFilled = (value: UserFormValues[keyof UserFormValues]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0;
    return value !== null;
};

// ¿El formulario puede enviarse? Solo habilita el botón de guardar — el backend revalida todo.
export const isUserFormValid = (role: ManagedRole, mode: UserFormMode, values: UserFormValues): boolean => {
    const fields = getUserFormFields(role, mode, values);
    const missingRequired = (Object.keys(fields) as (keyof UserFormValues)[])
        .some((field) => fields[field]?.required && !isFilled(values[field]));

    if (missingRequired) return false;
    if (values.first_name.trim().length < 2 || values.last_name.trim().length < 2) return false;
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) return false;
    if (fields.password && values.password && values.password.length < 8) return false;

    return true;
};

// Payload para POST (register) o PUT (edit) de /users/manage/:role.
export function toUserPayload(role: ManagedRole, mode: 'register', values: UserFormValues): CreateManagedUserPayload;
export function toUserPayload(role: ManagedRole, mode: 'edit', values: UserFormValues): UpdateManagedUserPayload;
export function toUserPayload(role: ManagedRole, mode: UserFormMode, values: UserFormValues): CreateManagedUserPayload | UpdateManagedUserPayload {
    const profile = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        date_birth: values.date_birth || null,
        phone: values.phone.trim(),
        email: values.email.trim(),
        country_id: values.country_id,
        document_type: values.document_type || null,
        document_number: values.document_number.trim() || null,
    };

    const sucursales = isSucursalRole(role) && values.sucursales !== null ? { sucursales: values.sucursales } : {};

    if (mode === 'register') {
        return { ...profile, ...(values.password ? { password: values.password } : {}), ...sucursales };
    }

    return {
        ...profile,
        is_enabled: values.is_enabled,
        ...(isSucursalRole(role) && isSucursalRole(values.role) && values.role !== role ? { role: values.role } : {}),
        ...sucursales,
    };
}
