export type PermissionAppAccess = 'admin' | 'booking' | 'both';

// Permiso del catálogo del sistema.
export interface PermissionAdmin {
    id: number;
    key: string;
    label: string;
    description: string | null;
    module: string;
    appAccess: PermissionAppAccess;
    // Cantidad de rutas del backend que usan `verificarPermiso(key)` — análisis estático del
    // código, no una columna de la tabla. 0 = permiso del catálogo sin ningún endpoint conectado.
    routesCount: number;
    // Cantidad de usuarios con este permiso asignado directamente (user_permission.permission_key).
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

// Payload de actualización — claves iguales a las columnas del modelo (contrato de escritura del backend).
export interface UpdatePermissionPayload {
    key?: string;
    label?: string;
    description?: string | null;
    module?: string;
    app_access?: PermissionAppAccess;
}

// Payload de creación — mismas claves que UpdatePermissionPayload; app_access es opcional (default en el backend, igual que en el modelo).
export interface CreatePermissionPayload {
    key: string;
    label: string;
    description: string | null;
    module: string;
    app_access: PermissionAppAccess;
}
