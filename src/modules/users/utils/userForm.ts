import { hasErrors, requiredErrors, type FormErrors } from '../../../shared/utils/formErrors';
import type {
    CreateManagedUserPayload, ManagedRole, ManagedUserDetail, SucursalRole, UpdateManagedUserPayload, UserFormMode, UserFormValues,
} from '../interfaces/user.interface';

const SUCURSAL_ROLES: readonly SucursalRole[] = ['administrador', 'empleado'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;

export type UserFormErrors = FormErrors<UserFormValues>;

export const isSucursalRole = (role: string): role is SucursalRole => SUCURSAL_ROLES.includes(role as SucursalRole);

// Reglas de un campo — mismas props que InputField, para volcarlas con spread en el componente.
export interface UserFieldRules {
    required: boolean;
    maxLength?: number;
    textOnly?: boolean;
    numberOnly?: boolean | 'integer';
}

export type UserFormFields = Partial<Record<keyof UserFormValues, UserFieldRules>>;

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
    // Solo el DNI es numérico — pasaporte, licencia y "otro" son alfanuméricos.
    const numericDocument = values.document_type === 'IDENTITY_CARD';

    return {
        first_name: { required: true, textOnly: true, maxLength: 100 },
        last_name: { required: true, textOnly: true, maxLength: 100 },
        date_birth: { required: false },
        phone: { required: true, numberOnly: 'integer', maxLength: 20 },
        email: { required: panelAccess },
        ...(mode === 'register' ? { password: { required: panelAccess, maxLength: 100 } } : {}),
        country_id: { required: true },
        document_type: { required: panelAccess },
        document_number: { required: panelAccess, numberOnly: numericDocument && 'integer', maxLength: 50 },
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
    sucursales: isSucursalRole(role) && manageSucursales ? detail.assignments.map((assignment) => assignment.publicId) : null,
});

/**
 * Mensaje de error por campo — obligatorios según getUserFormFields, más el formato de nombres,
 * correo y contraseña. Un campo sin entrada en el mapa está correcto.
 */
export const validateUserForm = (role: ManagedRole, mode: UserFormMode, values: UserFormValues): UserFormErrors => {
    const fields = getUserFormFields(role, mode, values);
    const required = (Object.keys(fields) as (keyof UserFormValues)[]).filter((field) => fields[field]?.required);
    const errors: UserFormErrors = requiredErrors(values, required);

    if (!errors.first_name && values.first_name.trim().length < MIN_NAME_LENGTH) errors.first_name = `Mínimo ${MIN_NAME_LENGTH} caracteres`;
    if (!errors.last_name && values.last_name.trim().length < MIN_NAME_LENGTH) errors.last_name = `Mínimo ${MIN_NAME_LENGTH} caracteres`;
    if (!errors.email && values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Correo inválido';
    if (fields.password && values.password && values.password.length < MIN_PASSWORD_LENGTH) errors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;

    return errors;
};

// ¿El formulario puede enviarse? Solo habilita el botón de guardar — el backend revalida todo.
export const isUserFormValid = (role: ManagedRole, mode: UserFormMode, values: UserFormValues): boolean =>
    !hasErrors(validateUserForm(role, mode, values));

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
