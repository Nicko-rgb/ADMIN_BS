import { apiService } from '../utils/apiService';
import type {
    Country, SportType, SportCategory, SurfaceType, PaymentType, Plan, RoleAdmin, UbigeoNode,
} from '../interfaces/catalog.interface';

/**
 * Catálogos activos de `system` para selects en toda la app — la administración de cada catálogo
 * (listado paginado, alta, edición, baja) vive en el service de su entidad dentro de `system`.
 * Sin cache: la cache vive en useCatalogActive.
 */
class CatalogActiveService {
    static async listCountries(): Promise<Country[]> {
        const res = await apiService.get('/system/countries/active');
        return res.data.data;
    }

    static async listSportTypes(): Promise<SportType[]> {
        const res = await apiService.get('/system/sport-types/active');
        return res.data.data;
    }

    static async listSportCategories(): Promise<SportCategory[]> {
        const res = await apiService.get('/system/sport-categories/active');
        return res.data.data;
    }

    static async listSurfaceTypes(): Promise<SurfaceType[]> {
        const res = await apiService.get('/system/surface-types/active');
        return res.data.data;
    }

    static async listPaymentTypes(): Promise<PaymentType[]> {
        const res = await apiService.get('/system/payment-types/active');
        return res.data.data;
    }

    static async listPlans(): Promise<Plan[]> {
        const res = await apiService.get('/saas/plans/active');
        return res.data.data;
    }

    static async listRoles(): Promise<RoleAdmin[]> {
        const res = await apiService.get('/system/roles');
        return res.data.data;
    }

    // Un nivel del ubigeo: `countryId` trae el nivel 1 de ese país, `parentId` los hijos directos de ese nodo.
    static async listUbigeoChildren(params: { countryId?: number; parentId?: number }): Promise<UbigeoNode[]> {
        const res = await apiService.get('/system/ubigeo', {
            params: { country_id: params.countryId, parent_id: params.parentId },
        });
        return res.data.data;
    }
}

export default CatalogActiveService;
