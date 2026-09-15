import { useState } from 'react';
import { createEmptyUserForm } from '../../users/utils/userForm';
import type { UserFormValues } from '../../users/interfaces/user.interface';

// Modal de alta de un administrador/empleado de las sucursales de la empresa — estado de
// FormUserManage en modo alta; el rol elegido (values.role) define el endpoint (/users/manage/:role).
export const useUserAsingSucursal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState<UserFormValues>(() => createEmptyUserForm('administrador'));

    const setField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const open = () => setIsOpen(true);

    const close = () => {
        setIsOpen(false);
        setValues(createEmptyUserForm('administrador'));
    };

    return { isOpen, open, close, values, setField };
};

export default useUserAsingSucursal;
