import { apiService } from '../../../shared/utils/apiService';
import type { CreateUbigeoPayload, Ubigeo, UbigeoNode, UpdateUbigeoPayload } from '../interfaces/catalog.interface';

// Catálogo de ubigeo — un método por endpoint.
class UbigeoService {

    static async create(payload: CreateUbigeoPayload): Promise<{ data: Ubigeo; message: string }> {
        const res = await apiService.post('/system/ubigeo', payload);
        return { data: res.data.data, message: res.data.message };
    }

    /**
     * Endpoint público en cascada — para selects: pasar `countryId` trae el nivel 1 de ese país,
     * pasar `parentId` trae los hijos directos de ese nodo (nunca ambos, nunca el árbol completo).
     */
    static async listChildren(params: { countryId?: number; parentId?: number }): Promise<UbigeoNode[]> {
        const res = await apiService.get('/system/ubigeo', {
            params: { country_id: params.countryId, parent_id: params.parentId },
        });
        return res.data.data;
    }

    static async update(id: number, payload: UpdateUbigeoPayload): Promise<{ data: Ubigeo; message: string }> {
        const res = await apiService.put(`/system/ubigeo/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/ubigeo/${id}`);
        return { message: res.data.message };
    }
}

export default UbigeoService;
