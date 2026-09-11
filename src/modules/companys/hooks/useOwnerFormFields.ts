import { useState } from 'react';
import type { OwnerStepForm } from '../interfaces/companyRegistration.interface';

const EMPTY_OWNER_FORM: OwnerStepForm = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    country_id: 0,
    document_type: '',
    document_number: '',
    date_birth: '',
};

/**
 * Estado y validación del paso "dueño" — compartido entre el wizard de alta (exige password,
 * es una cuenta nueva) y la edición del propio perfil (`requirePassword: false`, esa nunca la
 * toca). Arranca vacío; `preload` lo carga con los datos ya existentes (edición).
 */
export const useOwnerFormFields = (requirePassword: boolean) => {
    const [ownerForm, setOwnerForm] = useState<OwnerStepForm>(EMPTY_OWNER_FORM);

    const setOwnerField = (name: keyof OwnerStepForm) => (value: string | number) => {
        setOwnerForm((prev) => ({ ...prev, [name]: value }));
    };

    const preload = (form: OwnerStepForm) => setOwnerForm(form);

    const reset = () => setOwnerForm(EMPTY_OWNER_FORM);

    const isOwnerStepValid = Boolean(
        ownerForm.first_name.trim() && ownerForm.last_name.trim() && ownerForm.email.trim()
        && (!requirePassword || ownerForm.password.trim())
        && ownerForm.phone.trim() && ownerForm.country_id && ownerForm.document_type && ownerForm.document_number.trim()
    );

    return { ownerForm, setOwnerField, isOwnerStepValid, preload, reset };
};

export default useOwnerFormFields;
