import { useEffect, useMemo, useState } from 'react';
import { MenuService } from '../service/menuService';
import { handleApiError } from '../utils/errorHandler';
import { buildMenuGroups } from '../utils/menuTree';
import type { MenuItem } from '../interfaces/menu.interface';

/**
 * Carga el menú del usuario autenticado (ya filtrado por permisos en el
 * backend) al montar, lo agrupa/anida para el sidebar, y maneja qué ítems
 * con hijos (ej. "Catálogos") están expandidos.
 */
export const useMenu = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        let active = true;

        MenuService.getMenu()
            .then((data) => { if (active) setItems(data); })
            .catch((err) => { if (active) setError(handleApiError(err)); })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
    }, []);

    const groups = useMemo(() => buildMenuGroups(items), [items]);

    const toggleExpanded = (key: string) => {
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return { groups, isLoading, error, expandedKeys, toggleExpanded };
};
