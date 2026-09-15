import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';

/**
 * Devuelve `can(...permissions)`: true si el usuario autenticado tiene al menos uno de los
 * permisos indicados — mismo criterio que verificarPermiso en el backend (system.full_access
 * bypasea cualquier chequeo). Solo condiciona qué se renderiza; la seguridad real la garantiza el
 * backend.
 *   const can = usePermission();
 *   const canConfirm = can('booking.confirm');
 *   const canManageUsers = can('user.administrator_manage', 'user.employee_manage');
 *   rows.map((row) => can(ROLE_MANAGE_PERMISSIONS[row.role]) && ...);
 */
export const usePermission = () => {
    const permissions = useSessionStore((state) => state.permissions);

    return useCallback(
        (...required: string[]) => permissions.includes('system.full_access') || required.some((permission) => permissions.includes(permission)),
        [permissions],
    );
};
