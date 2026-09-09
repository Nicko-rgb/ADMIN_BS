// Ítem de menú ya filtrado por permisos del backend — tal como lo devuelve GET /system/menu.
export interface MenuItem {
    key: string;
    label: string;
    icon: string | null;
    path: string | null;
    parentKey: string | null;
    groupTitle: string | null;
}

// Ítem de menú con sus hijos ya resueltos (armado en el front a partir de parentKey).
export interface MenuNode extends MenuItem {
    children: MenuNode[];
}

// Sección del sidebar — todos los ítems raíz (sin parentKey) que comparten groupTitle.
export interface MenuGroup {
    title: string;
    items: MenuNode[];
}
