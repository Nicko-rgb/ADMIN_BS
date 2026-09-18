import { apiService } from '../../../shared/utils/apiService';
import type { Country } from '../../../shared/interfaces/catalog.interface';
import type { CreateCountryPayload, UpdateCountryPayload } from '../interfaces/catalog.interface';

// Catálogo de países — un método por endpoint.
class CountryService {
    // Todos los países (activos e inactivos), sin paginar — catálogo chico.
    static async list(): Promise<Country[]> {
        const res = await apiService.get('/system/countries');
        return res.data.data;
    }

    // Catálogo de países activos: CatalogActiveService.listCountries() (shared/service).

    static async create(payload: CreateCountryPayload): Promise<{ data: Country; message: string }> {
        const res = await apiService.post('/system/countries', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdateCountryPayload): Promise<{ data: Country; message: string }> {
        const res = await apiService.put(`/system/countries/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/countries/${id}`);
        return { message: res.data.message };
    }
}

export default CountryService;
