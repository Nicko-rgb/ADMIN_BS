import { REQUIRED_MESSAGE, requiredErrors } from '../../../shared/utils/formErrors';
import type { CompanyStepErrors, CompanyStepForm } from '../interfaces/companyRegistration.interface';

const REQUIRED_FIELDS: (keyof CompanyStepForm)[] = ['name', 'document', 'phone_cell', 'address'];

// Primer nivel sin elegir de la cascada de ubicación — los siguientes están deshabilitados hasta completarlo.
const missingUbigeoLevel = (form: CompanyStepForm, departmentId: number, provinceId: number): keyof CompanyStepErrors | null => {
    if (!form.country_id) return 'country_id';
    if (!departmentId) return 'department_id';
    if (!provinceId) return 'province_id';
    if (!form.ubigeo_id) return 'ubigeo_id';
    return null;
};

// Mensaje de error por campo del paso "empresa" — un campo sin entrada en el mapa está correcto.
export const validateCompanyStep = (form: CompanyStepForm, departmentId: number, provinceId: number): CompanyStepErrors => {
    const errors: CompanyStepErrors = requiredErrors(form, REQUIRED_FIELDS);
    const missingLevel = missingUbigeoLevel(form, departmentId, provinceId);

    if (missingLevel) errors[missingLevel] = REQUIRED_MESSAGE;

    return errors;
};
