export type PermissionAppAccess = 'admin' | 'booking' | 'both';
// Carpetas reales bajo src/modules/ del backend — mismo enum que dsg_bss_permissions.module.
export type PermissionModule = 'bookings' | 'companys' | 'notificacions' | 'saas' | 'system' | 'users';

// Permiso del catálogo del sistema.
export interface PermissionAdmin {
    id: number;
    key: string;
    label: string;
    description: string | null;
    // Módulo real del código al que pertenece el permiso.
    module: PermissionModule;
    // Agrupación funcional dentro de ese módulo (booking, payment, space, sucursal, company...).
    groupName: string;
    appAccess: PermissionAppAccess;
    // Cantidad de rutas del backend que usan `verificarPermiso(key)` — análisis estático del
    // código, no una columna de la tabla. 0 = permiso del catálogo sin ningún endpoint conectado.
    routesCount: number;
    // Cantidad de usuarios con este permiso asignado directamente (user_permission.permission_key).
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

// Módulos y grupos distintos del catálogo — para poblar los dos filtros de PermissionsPage.
export interface PermissionFilters {
    modules: PermissionModule[];
    groups: string[];
}

// Payload de actualización — claves iguales a las columnas del modelo (contrato de escritura del backend).
export interface UpdatePermissionPayload {
    key?: string;
    label?: string;
    description?: string | null;
    module?: PermissionModule;
    group_name?: string;
    app_access?: PermissionAppAccess;
}

// Payload de creación — mismas claves que UpdatePermissionPayload; app_access es opcional (default en el backend, igual que en el modelo).
export interface CreatePermissionPayload {
    key: string;
    label: string;
    description: string | null;
    module: PermissionModule;
    group_name: string;
    app_access: PermissionAppAccess;
}
