import { REQUIRED_MESSAGE, isValidUrl, requiredErrors, type FormErrors } from '../../../shared/utils/formErrors';
import type { CompanyStepForm } from '../interfaces/companyRegistration.interface';
import type { SucursalFormData } from '../interfaces/sucursal.interface';

// Empresa y sucursal resuelven su ubicación con la misma cascada país → departamento → provincia → distrito.
export interface UbigeoForm {
    country_id: number;
    ubigeo_id: number;
}

// `department_id` y `province_id` son niveles intermedios: se eligen en el form pero no viajan en el payload.
export type UbigeoField = 'country_id' | 'department_id' | 'province_id' | 'ubigeo_id';

export type TenantFormErrors<T> = FormErrors<T> & Partial<Record<UbigeoField, string>>;

export const EMPTY_COMPANY_FORM: CompanyStepForm = {
    name: '',
    document: '',
    country_id: 0,
    ubigeo_id: 0,
    address: '',
    phone_cell: '',
    phone: '',
};

export const COMPANY_REQUIRED_FIELDS: (keyof CompanyStepForm)[] = ['name', 'document', 'phone_cell', 'address'];

export const EMPTY_SUCURSAL_FORM: SucursalFormData = {
    name: '',
    address: '',
    country_id: 0,
    ubigeo_id: 0,
    phone_cell: '',
    phone: '',
    latitude: '',
    longitude: '',
    description: '',
    website: '',
};

export const SUCURSAL_REQUIRED_FIELDS: (keyof SucursalFormData)[] = ['name', 'address', 'phone_cell'];

// Coordenada opcional — vacía pasa; con valor debe ser un número dentro de ±max.
const coordinateError = (value: string, max: number): string | undefined => {
    if (!value.trim()) return undefined;

    const parsed = Number(value);
    return Number.isFinite(parsed) && Math.abs(parsed) <= max ? undefined : `Debe ser un número entre -${max} y ${max}`;
};

/**
 * Reglas de la sucursal que van más allá de "obligatorio": el sitio web, si trae valor, debe ser
 * una URL http(s), y las coordenadas deben caer en el rango que acepta el backend.
 */
export const sucursalExtraRules = (form: SucursalFormData): FormErrors<SucursalFormData> => {
    const errors: FormErrors<SucursalFormData> = {};

    if (form.website.trim() && !isValidUrl(form.website)) errors.website = 'Ingresá una URL válida (https://...)';

    const latitude = coordinateError(form.latitude, 90);
    if (latitude) errors.latitude = latitude;

    const longitude = coordinateError(form.longitude, 180);
    if (longitude) errors.longitude = longitude;

    return errors;
};

// Primer nivel sin elegir de la cascada — los siguientes están deshabilitados hasta completarlo.
const missingUbigeoLevel = (form: UbigeoForm, departmentId: number, provinceId: number): UbigeoField | null => {
    if (!form.country_id) return 'country_id';
    if (!departmentId) return 'department_id';
    if (!provinceId) return 'province_id';
    if (!form.ubigeo_id) return 'ubigeo_id';
    return null;
};

/**
 * Mensaje de error por campo de un formulario de empresa o sucursal — los campos de `required`
 * vacíos más el primer nivel sin elegir del ubigeo. Un campo sin entrada en el mapa está correcto.
 */
export const validateTenantForm = <T extends UbigeoForm>(
    form: T,
    required: (keyof T)[],
    departmentId: number,
    provinceId: number,
): TenantFormErrors<T> => {
    const errors: TenantFormErrors<T> = { ...requiredErrors(form, required) };
    const missingLevel = missingUbigeoLevel(form, departmentId, provinceId);

    if (missingLevel) errors[missingLevel] = REQUIRED_MESSAGE;

    return errors;
};
