import { useCallback, useState } from 'react';
import CatalogActiveService from '../service/catalogActiveService';
import { handleApiError } from '../utils/errorHandler';
import toast from '../utils/toast';
import type {
    Country, SportType, SportCategory, SurfaceType, PaymentType, Plan,
} from '../../modules/system/interfaces/catalog.interface';

// Cache a nivel de módulo, una por catálogo — se comparte entre todos los componentes que llaman
// a su load*, así cada catálogo se pide una sola vez por sesión sin importar cuántas pantallas lo
// usen (ni cuántas veces React.StrictMode monte el mismo componente en desarrollo).
let countriesCache: Country[] | null = null;
let countriesInFlight: Promise<Country[]> | null = null;

let sportTypesCache: SportType[] | null = null;
let sportTypesInFlight: Promise<SportType[]> | null = null;

let sportCategoriesCache: SportCategory[] | null = null;
let sportCategoriesInFlight: Promise<SportCategory[]> | null = null;

let surfaceTypesCache: SurfaceType[] | null = null;
let surfaceTypesInFlight: Promise<SurfaceType[]> | null = null;

let paymentTypesCache: PaymentType[] | null = null;
let paymentTypesInFlight: Promise<PaymentType[]> | null = null;

let plansCache: Plan[] | null = null;
let plansInFlight: Promise<Plan[]> | null = null;

/**
 * Catálogos activos de `system` para selects/lógica de negocio en toda la app (ej. país al
 * registrar una empresa). Cada catálogo tiene su propio estado y su propio load* — el hook no
 * dispara ningún fetch por sí solo: cada pantalla llama, dentro de su propio useEffect, solo a
 * los load* de los catálogos que realmente necesita, así no se piden catálogos que esa pantalla
 * nunca usa. Cada load* está cacheado a nivel de módulo: si el catálogo ya se pidió en esta
 * sesión (desde cualquier pantalla), no vuelve a golpear el backend.
 */
export const useCatalogActive = () => {
    const [countries, setCountries] = useState<Country[]>(countriesCache ?? []);
    const [isLoadingCountries, setIsLoadingCountries] = useState(!countriesCache);

    const loadCountries = useCallback(async () => {
        if (countriesCache) return;
        if (!countriesInFlight) countriesInFlight = CatalogActiveService.listCountries();

        try {
            const result = await countriesInFlight;
            countriesCache = result;
            setCountries(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingCountries(false);
            countriesInFlight = null;
        }
    }, []);

    const [sportTypes, setSportTypes] = useState<SportType[]>(sportTypesCache ?? []);
    const [isLoadingSportTypes, setIsLoadingSportTypes] = useState(!sportTypesCache);

    const loadSportTypes = useCallback(async () => {
        if (sportTypesCache) return;
        if (!sportTypesInFlight) sportTypesInFlight = CatalogActiveService.listSportTypes();

        try {
            const result = await sportTypesInFlight;
            sportTypesCache = result;
            setSportTypes(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingSportTypes(false);
            sportTypesInFlight = null;
        }
    }, []);

    const [sportCategories, setSportCategories] = useState<SportCategory[]>(sportCategoriesCache ?? []);
    const [isLoadingSportCategories, setIsLoadingSportCategories] = useState(!sportCategoriesCache);

    const loadSportCategories = useCallback(async () => {
        if (sportCategoriesCache) return;
        if (!sportCategoriesInFlight) sportCategoriesInFlight = CatalogActiveService.listSportCategories();

        try {
            const result = await sportCategoriesInFlight;
            sportCategoriesCache = result;
            setSportCategories(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingSportCategories(false);
            sportCategoriesInFlight = null;
        }
    }, []);

    const [surfaceTypes, setSurfaceTypes] = useState<SurfaceType[]>(surfaceTypesCache ?? []);
    const [isLoadingSurfaceTypes, setIsLoadingSurfaceTypes] = useState(!surfaceTypesCache);

    const loadSurfaceTypes = useCallback(async () => {
        if (surfaceTypesCache) return;
        if (!surfaceTypesInFlight) surfaceTypesInFlight = CatalogActiveService.listSurfaceTypes();

        try {
            const result = await surfaceTypesInFlight;
            surfaceTypesCache = result;
            setSurfaceTypes(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingSurfaceTypes(false);
            surfaceTypesInFlight = null;
        }
    }, []);

    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>(paymentTypesCache ?? []);
    const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(!paymentTypesCache);

    const loadPaymentTypes = useCallback(async () => {
        if (paymentTypesCache) return;
        if (!paymentTypesInFlight) paymentTypesInFlight = CatalogActiveService.listPaymentTypes();

        try {
            const result = await paymentTypesInFlight;
            paymentTypesCache = result;
            setPaymentTypes(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingPaymentTypes(false);
            paymentTypesInFlight = null;
        }
    }, []);

    const [plans, setPlans] = useState<Plan[]>(plansCache ?? []);
    const [isLoadingPlans, setIsLoadingPlans] = useState(!plansCache);

    const loadPlans = useCallback(async () => {
        if (plansCache) return;
        if (!plansInFlight) plansInFlight = CatalogActiveService.listPlans();

        try {
            const result = await plansInFlight;
            plansCache = result;
            setPlans(result);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingPlans(false);
            plansInFlight = null;
        }
    }, []);

    return {
        countries, isLoadingCountries, loadCountries,
        sportTypes, isLoadingSportTypes, loadSportTypes,
        sportCategories, isLoadingSportCategories, loadSportCategories,
        surfaceTypes, isLoadingSurfaceTypes, loadSurfaceTypes,
        paymentTypes, isLoadingPaymentTypes, loadPaymentTypes,
        plans, isLoadingPlans, loadPlans,
    };
};

export default useCatalogActive;
