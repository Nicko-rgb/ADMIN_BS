import { useEffect, useState } from 'react';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import useOwnerFormFields from './useOwnerFormFields';

const ASSIGNABLE_ROLE_KEYS = ['administrador', 'empleado'];

// Modal de alta de un administrador/empleado asignado a una sucursal puntual de la empresa —
// datos personales vía useOwnerFormFields (mismos campos que el dueño en el wizard de alta).
export const useUserAsingSucursal = () => {
    const { roles, loadRoles, countries, loadCountries } = useCatalogActive();
    const { ownerForm, setOwnerField, isOwnerStepValid, reset: resetOwnerForm } = useOwnerFormFields(true);
    const [isOpen, setIsOpen] = useState(false);
    const [roleKey, setRoleKey] = useState('');
    const [sucursalTenantId, setSucursalTenantId] = useState('');

    useEffect(() => { loadRoles(); loadCountries(); }, [loadRoles, loadCountries]);

    const roleOptions = roles
        .filter((role) => ASSIGNABLE_ROLE_KEYS.includes(role.key))
        .map((role) => ({ value: role.key, label: role.label }));

    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    const open = () => setIsOpen(true);

    const close = () => {
        setIsOpen(false);
        setRoleKey('');
        setSucursalTenantId('');
        resetOwnerForm();
    };

    return {
        isOpen, open, close,
        roleOptions, roleKey, setRoleKey,
        sucursalTenantId, setSucursalTenantId,
        ownerForm, setOwnerField, isOwnerStepValid, countryOptions,
    };
};

export default useUserAsingSucursal;
