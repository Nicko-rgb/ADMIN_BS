import { apiService } from '../utils/apiService';
import type {
    Country, SportType, SportCategory, SurfaceType, PaymentType, Plan, RoleAdmin, UbigeoNode,
} from '../interfaces/catalog.interface';

const extractArrayData = <T>(payload: unknown): T[] => {
    if (!payload || typeof payload !== 'object' || !('data' in payload)) return [];
    const { data } = payload as { data?: unknown };
    return Array.isArray(data) ? data as T[] : [];
};

/**
 * Catálogos activos de `system` para selects en toda la app — la administración de cada catálogo
 * (listado paginado, alta, edición, baja) vive en el service de su entidad dentro de `system`.
 * Sin cache: la cache vive en useCatalogActive.
 */
class CatalogActiveService {
    static async listCountries(): Promise<Country[]> {
        const res = await apiService.get('/system/countries/active');
        return extractArrayData<Country>(res.data);
    }

    static async listSportTypes(): Promise<SportType[]> {
        const res = await apiService.get('/system/sport-types/active');
        return extractArrayData<SportType>(res.data);
    }

    static async listSportCategories(): Promise<SportCategory[]> {
        const res = await apiService.get('/system/sport-categories/active');
        return extractArrayData<SportCategory>(res.data);
    }

    static async listSurfaceTypes(): Promise<SurfaceType[]> {
        const res = await apiService.get('/system/surface-types/active');
        return extractArrayData<SurfaceType>(res.data);
    }

    static async listPaymentTypes(): Promise<PaymentType[]> {
        const res = await apiService.get('/system/payment-types/active');
        return extractArrayData<PaymentType>(res.data);
    }

    static async listPlans(): Promise<Plan[]> {
        const res = await apiService.get('/saas/plans/active');
        return extractArrayData<Plan>(res.data);
    }

    static async listRoles(): Promise<RoleAdmin[]> {
        const res = await apiService.get('/system/roles');
        return extractArrayData<RoleAdmin>(res.data);
    }

    // Un nivel del ubigeo: `countryId` trae el nivel 1 de ese país, `parentId` los hijos directos de ese nodo.
    static async listUbigeoChildren(params: { countryId?: number; parentId?: number }): Promise<UbigeoNode[]> {
        const res = await apiService.get('/system/ubigeo', {
            params: { country_id: params.countryId, parent_id: params.parentId },
        });
        return extractArrayData<UbigeoNode>(res.data);
    }
}

export default CatalogActiveService;
