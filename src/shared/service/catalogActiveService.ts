import { apiService } from '../utils/apiService';
import type {
    Country, SportType, SportCategory, SurfaceType, PaymentType, Plan,
} from '../../modules/system/interfaces/catalog.interface';

/**
 * Endpoints públicos "/active" de los catálogos de `system` — se agrupan acá porque los consume
 * código de varios módulos (companys, users, system) para selects/lógica de negocio en toda la
 * app, no la administración de cada catálogo (eso sigue viviendo en el service de cada entidad:
 * list/create/update/delete paginado). Cada método es un fetch simple, sin cache — la cache vive
 * en el hook que lo consume (ver shared/hooks/createActiveCatalogHook.ts).
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
        const res = await apiService.get('/system/plans/active');
        return res.data.data;
    }
}

export default CatalogActiveService;
