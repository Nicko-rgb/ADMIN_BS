import { useCallback, useState } from 'react';
import CatalogActiveService from '../service/catalogActiveService';
import { handleApiError } from '../utils/errorHandler';
import toast from '../utils/toast';
import type { UbigeoNode } from '../interfaces/catalog.interface';

type UbigeoLevel = 1 | 2 | 3;

/**
 * Cascada de ubigeo (nivel 1 → 2 → 3) — cada nivel tiene su propio estado y su propia bandera de
 * carga (para poder mostrar el spinner exacto del nivel que se está pidiendo), pero una sola
 * función `loadLevel(level, params)` resuelve los tres: sabe, por el nivel que le pasan, en qué
 * estado guardar el resultado y qué bandera de carga prender/apagar — así quien la llama no
 * repite el try/finally de cada nivel a mano. Sin cache, a diferencia de los catálogos "active":
 * el árbol se navega, nunca se trae completo, así que cada llamada es un fetch real contra el
 * nivel pedido. `clearLevel` vacía un nivel sin pedir nada (ej. al colapsar una rama del árbol).
 */
export const useUbigeoCascade = () => {
    const [level1Items, setLevel1Items] = useState<UbigeoNode[]>([]);
    const [level2Items, setLevel2Items] = useState<UbigeoNode[]>([]);
    const [level3Items, setLevel3Items] = useState<UbigeoNode[]>([]);

    const [isLoadingLevel1, setIsLoadingLevel1] = useState(false);
    const [isLoadingLevel2, setIsLoadingLevel2] = useState(false);
    const [isLoadingLevel3, setIsLoadingLevel3] = useState(false);

    const loadLevel = useCallback(async (level: UbigeoLevel, params: { countryId?: number; parentId?: number }) => {
        const setItems = { 1: setLevel1Items, 2: setLevel2Items, 3: setLevel3Items }[level];
        const setLoading = { 1: setIsLoadingLevel1, 2: setIsLoadingLevel2, 3: setIsLoadingLevel3 }[level];

        setLoading(true);
        try {
            setItems(await CatalogActiveService.listUbigeoChildren(params));
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const clearLevel = useCallback((level: UbigeoLevel) => {
        const setItems = { 1: setLevel1Items, 2: setLevel2Items, 3: setLevel3Items }[level];
        setItems([]);
    }, []);

    return {
        level1Items, level2Items, level3Items,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        loadLevel, clearLevel,
    };
};

export default useUbigeoCascade;
