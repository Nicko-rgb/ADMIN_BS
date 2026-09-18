import { apiService } from '../../../shared/utils/apiService';
import type { CreateUbigeoPayload, Ubigeo, UpdateUbigeoPayload } from '../interfaces/catalog.interface';

// Administración del catálogo de ubigeo — un método por endpoint.
class UbigeoService {

    static async create(payload: CreateUbigeoPayload): Promise<{ data: Ubigeo; message: string }> {
        const res = await apiService.post('/system/ubigeo', payload);
        return { data: res.data.data, message: res.data.message };
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
