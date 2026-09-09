import { useSessionStore } from '../store/sessionStore';

/**
 * Chequea si el usuario autenticado tiene el permiso indicado — mismo
 * criterio que el backend (verificarPermiso): system.full_access bypasea
 * cualquier chequeo. Uso: condicionar qué se renderiza, nunca seguridad real
 * (esa la sigue garantizando el backend).
 *   const canConfirm = usePermission('booking.confirm');
 *   return canConfirm && <Button text="Confirmar" onClick={handleConfirm} />;
 */
export const usePermission = (permission: string): boolean => {
    const permissions = useSessionStore((state) => state.permissions);
    return permissions.includes('system.full_access') || permissions.includes(permission);
};
