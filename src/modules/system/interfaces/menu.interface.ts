export type MenuAppAccess = 'admin' | 'booking' | 'both';

// Ítem de menú — vista admin (system.full_access), sin el filtro por permiso que sí aplica el menú
// de navegación real (ese usa un DTO más chico, consumido aparte para armar el sidebar).
export interface MenuItemAdmin {
    id: number;
    key: string;
    label: string;
    icon: string | null;
    path: string | null;
    parentKey: string | null;
    requiredPermission: string | null;
    appAccess: MenuAppAccess;
    groupTitle: string | null;
    sortOrder: number;
    isActive: boolean;
    childrenCount: number;
    createdAt: string;
    updatedAt: string;
}

// Payload de actualización — claves snake_case, iguales a las columnas del modelo (contrato de escritura del backend).
export interface UpdateMenuItemPayload {
    key?: string;
    label?: string;
    icon?: string | null;
    path?: string | null;
    parent_key?: string | null;
    required_permission?: string | null;
    app_access?: MenuAppAccess;
    group_title?: string | null;
    sort_order?: number;
    is_active?: boolean;
}

// Payload de creación — mismas claves que UpdateMenuItemPayload; app_access/sort_order/is_active
// son opcionales (default en el backend, igual que en el modelo).
export interface CreateMenuItemPayload {
    key: string;
    label: string;
    icon: string | null;
    path: string | null;
    parent_key: string | null;
    required_permission: string | null;
    app_access: MenuAppAccess;
    group_title: string | null;
    sort_order: number;
    is_active: boolean;
}
