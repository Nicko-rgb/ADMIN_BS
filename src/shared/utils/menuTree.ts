import { iconNames, type IconName } from 'lucide-react/dynamic';
import type { MenuGroup, MenuItem, MenuNode } from '../interfaces/menu.interface';

const normalizeIconName = (name: string): string => name.trim().replace(/-/g, '').toLowerCase();

const lucideNames = new Map<string, IconName>(
    iconNames.map((name) => [normalizeIconName(name), name]),
);

export const resolveLucideIconName = (name: string | null): IconName | null =>
    name ? lucideNames.get(normalizeIconName(name)) ?? null : null;

/**
 * Arma la estructura de secciones/árbol del sidebar a partir del listado
 * plano que devuelve el backend (ya filtrado por permisos): agrupa por
 * groupTitle y anida por parentKey. El orden ya viene resuelto por el
 * backend (group_title, sort_order) — acá solo se agrupa, no se reordena.
 */
export const buildMenuGroups = (items: MenuItem[] = []): MenuGroup[] => {
    const safeItems = Array.isArray(items) ? items : [];
    const roots = safeItems.filter((item) => !item.parentKey);
    const groups: MenuGroup[] = [];

    for (const root of roots) {
        const title = root.groupTitle ?? '';
        let group = groups.find((g) => g.title === title);
        if (!group) {
            group = { title, items: [] };
            groups.push(group);
        }

        const children: MenuNode[] = safeItems
            .filter((item) => item.parentKey === root.key)
            .map((item) => ({ ...item, children: [] }));

        group.items.push({ ...root, children });
    }

    return groups;
};
