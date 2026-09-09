// Metadata de paginación tal como la devuelve el backend en el `extra` de ApiResponse.ok.
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Forma de cualquier respuesta de listado paginado — data pura + metadata separada.
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
