import { useCallback, useEffect, useState } from 'react';
import CountryService from '../../modules/system/service/countryService';
import SportTypeService from '../../modules/system/service/sportTypeService';
import SportCategoryService from '../../modules/system/service/sportCategoryService';
import SurfaceTypeService from '../../modules/system/service/surfaceTypeService';
import PaymentTypeService from '../../modules/system/service/paymentTypeService';
import PlanService from '../../modules/system/service/planService';
import UbigeoService from '../../modules/system/service/ubigeoService';
import { handleApiError } from '../utils/errorHandler';
import toast from '../utils/toast';
import type {
    Country, SportType, SportCategory, SurfaceType, PaymentType, Plan, UbigeoNode,
} from '../../modules/system/interfaces/catalog.interface';

interface CatalogActiveState {
    countries: Country[];
    sportTypes: SportType[];
    sportCategories: SportCategory[];
    surfaceTypes: SurfaceType[];
    paymentTypes: PaymentType[];
    plans: Plan[];
}

const EMPTY_STATE: CatalogActiveState = {
    countries: [], sportTypes: [], sportCategories: [], surfaceTypes: [], paymentTypes: [], plans: [],
};

// Cache a nivel de módulo — se comparte entre todos los componentes que usan el hook, así los 6
// catálogos solo se piden una vez por sesión, no una vez por cada componente que lo monta.
let cache: CatalogActiveState | null = null;
let inFlight: Promise<CatalogActiveState> | null = null;

const fetchAllActive = async (): Promise<CatalogActiveState> => {
    const [countries, sportTypes, sportCategories, surfaceTypes, paymentTypes, plans] = await Promise.all([
        CountryService.listActive(),
        SportTypeService.listActive(),
        SportCategoryService.listActive(),
        SurfaceTypeService.listActive(),
        PaymentTypeService.listActive(),
        PlanService.listActive(),
    ]);
    return { countries, sportTypes, sportCategories, surfaceTypes, paymentTypes, plans };
};

/**
 * Catálogos activos de `system` para lógica de negocio en toda la app (ej. selects de país al
 * registrar una empresa) — endpoints públicos, sin autenticación, así los puede usar tanto
 * ADMIN_APP como el futuro FRONTEND_BOOKING (usuarios sin sesión).
 *
 * Se piden 6 de los 7 catálogos en paralelo una sola vez por sesión (cache a nivel de módulo,
 * compartida entre todos los componentes que usan el hook — `reload()` la refresca a mano).
 * Ubigeo queda afuera de la carga automática: es potencialmente grande y se navega en cascada
 * (país → nivel 1 → nivel 2 → ...), nunca se trae completo — usar `loadUbigeoChildren`.
 */
export const useCatalogActive = () => {
    const [data, setData] = useState<CatalogActiveState>(cache ?? EMPTY_STATE);
    const [isLoading, setIsLoading] = useState(!cache);

    useEffect(() => {
        // Ya reflejado en el estado inicial (useState lee `cache` directo) — nada que hacer.
        if (cache) return;

        let active = true;

        const fetchAll = async () => {
            if (!inFlight) inFlight = fetchAllActive();

            try {
                const result = await inFlight;
                cache = result;
                if (active) setData(result);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
                inFlight = null;
            }
        };

        fetchAll();

        return () => { active = false; };
    }, []);

    // Refresca los 6 catálogos a mano (ej. después de editar uno desde el admin) — ignora la cache existente.
    const reload = useCallback(async () => {
        setIsLoading(true);
        inFlight = fetchAllActive();

        try {
            const result = await inFlight;
            cache = result;
            setData(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoading(false);
            inFlight = null;
        }
    }, []);

    // Nivel 1 de un país o hijos directos de un nodo — bajo demanda, sin cache (el árbol se navega, no se guarda completo).
    const loadUbigeoChildren = useCallback(async (params: { countryId?: number; parentId?: number }): Promise<UbigeoNode[]> => {
        try {
            return await UbigeoService.listChildren(params);
        } catch (err) {
            toast.error(handleApiError(err));
            return [];
        }
    }, []);

    return { ...data, isLoading, reload, loadUbigeoChildren };
};
