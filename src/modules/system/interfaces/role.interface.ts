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
