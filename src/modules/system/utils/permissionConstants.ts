import type { PermissionModule } from '../interfaces/permission.interface';

// Única fuente de verdad de las 6 carpetas reales bajo src/modules/ del backend — mismo enum que
// dsg_bss_permissions.module (010_baseline_permissions.ts). Antes vivía triplicada (con el mismo
// contenido escrito a mano tres veces) en EditRegisterPermission.tsx, ManageRolePermissions.tsx y
// ManageUserPermissions.tsx — cualquier cambio acá alcanza a los tres.
const MODULES: { value: PermissionModule; label: string }[] = [
    { value: 'bookings', label: 'Bookings' },
    { value: 'companys', label: 'Companys' },
    { value: 'notificacions', label: 'Notificaciones' },
    { value: 'saas', label: 'SaaS' },
    { value: 'system', label: 'System' },
    { value: 'users', label: 'Users' },
];

// Para SelectField (EditRegisterPermission.tsx).
export const MODULE_OPTIONS = MODULES.map(({ value, label }) => ({ value, label }));

// Para lookup directo por key (ManageUserPermissions.tsx / ManageRolePermissions.tsx).
export const MODULE_LABELS: Record<PermissionModule, string> = Object.fromEntries(
    MODULES.map(({ value, label }) => [value, label])
) as Record<PermissionModule, string>;
