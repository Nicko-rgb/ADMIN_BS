import type { ComponentType } from 'react';
import {
    Home, Building2, Users2, ShieldCheck, Menu, Layers, Globe, Trophy, Tags,
    Grid3x3, CreditCard, MapPin, Gift, Crown, Eye, FileText, BarChart2,
} from 'lucide-react';
import { TbCalendarCheck } from 'react-icons/tb';
import type { MenuGroup, MenuItem, MenuNode } from '../interfaces/menu.interface';

/**
 * Arma la estructura de secciones/árbol del sidebar a partir del listado
 * plano que devuelve el backend (ya filtrado por permisos): agrupa por
 * groupTitle y anida por parentKey. El orden ya viene resuelto por el
 * backend (group_title, sort_order) — acá solo se agrupa, no se reordena.
 */
export const buildMenuGroups = (items: MenuItem[]): MenuGroup[] => {
    const roots = items.filter((item) => !item.parentKey);
    const groups: MenuGroup[] = [];

    for (const root of roots) {
        const title = root.groupTitle ?? '';
        let group = groups.find((g) => g.title === title);
        if (!group) {
            group = { title, items: [] };
            groups.push(group);
        }

        const children: MenuNode[] = items
            .filter((item) => item.parentKey === root.key)
            .map((item) => ({ ...item, children: [] }));

        group.items.push({ ...root, children });
    }

    return groups;
};

type IconComponent = ComponentType<{ size?: number; className?: string }>;

// Nombre del ícono tal como lo guarda dsg_bss_menu_items -> componente. La
// mayoría son de lucide-react; TbCalendarCheck es la única excepción de
// react-icons/tb que ya trae la data sembrada así.
const MENU_ICONS: Record<string, IconComponent> = {
    Home, Building2, Users2, ShieldCheck, Menu, Layers, Globe, Trophy, Tags,
    Grid3x3, CreditCard, MapPin, Gift, Crown, Eye, FileText, BarChart2,
    TbCalendarCheck,
};

// Resuelve el nombre de ícono de la DB a su componente — null si no hay match, para no romper el render.
export const resolveMenuIcon = (iconName: string | null): IconComponent | null =>
    iconName ? (MENU_ICONS[iconName] ?? null) : null;
