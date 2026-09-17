import { useState } from 'react';
import type { FormEvent } from 'react';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { hasErrors } from '../../../shared/utils/formErrors';
import toast from '../../../shared/utils/toast';
import ManageUserService from '../../users/service/manageUserService';
import { createEmptyUserForm, toUserPayload, validateUserForm } from '../../users/utils/userForm';
import type { UserFormValues } from '../../users/interfaces/user.interface';

interface UseUserAsingSucursalArgs {
    onClose: () => void;
    onSaved: () => void;
}

/**
 * Alta de un administrador/empleado de las sucursales de la empresa — el rol elegido
 * (`values.role`) define el endpoint (/users/manage/:role) y `values.sucursales` las
 * asignaciones que crea el backend en la misma transacción.
 */
export const useUserAsingSucursal = ({ onClose, onSaved }: UseUserAsingSucursalArgs) => {
    const [values, setValues] = useState<UserFormValues>(() => createEmptyUserForm('administrador'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Los errores por campo recién se pintan cuando se intenta guardar con el form incompleto.
    const [showErrors, setShowErrors] = useState(false);

    const setField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const errors = validateUserForm(values.role, 'register', values);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (hasErrors(errors)) {
            setShowErrors(true);
            toast.error('Completa los campos obligatorios para continuar');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await ManageUserService.create(values.role, toUserPayload(values.role, 'register', values));
            toast.success(result.message);
            onSaved();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return { values, setField, errors: showErrors ? errors : {}, isSubmitting, handleSubmit };
};

export default useUserAsingSucursal;
