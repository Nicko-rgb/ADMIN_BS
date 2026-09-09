// Rol del sistema — 5 roles base sembrados (cliente, empleado, administrador, super_admin,
// system) más los que se creen desde System > Permisos > tab Roles. Los 5 base no se pueden
// editar la key ni eliminar (ver role.service.ts::RESERVED_ROLE_KEYS en el backend).
export interface RoleAdmin {
    id: number;
    key: string;
    label: string;
    // Alcance de datos: 1=system (todo), 2=super_admin (sus empresas), 3=administrador
    // (sus sucursales), 4=empleado (sus sucursales), null=no aplica (ej. cliente).
    scopeLevel: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Payload de alta — `key` es una sola palabra (sin puntos, a diferencia de un permission.key).
export interface CreateRolePayload {
    key: string;
    label: string;
    scope_level: number | null;
    is_active: boolean;
}

// Edición parcial — claves iguales a las columnas del modelo (contrato de escritura del backend). `key` no se edita.
export interface UpdateRolePayload {
    label?: string;
    scope_level?: number | null;
    is_active?: boolean;
}
