import { apiService } from '../../../shared/utils/apiService';
import type { SpaceFormValues, SpaceListItem } from '../interfaces/space.interface';

// Espacios deportivos de una sucursal — por ahora alta y listado (el backend aún
// no expone edición); el payload usa los mismos nombres que space.schema.ts.
class SpaceService {
    static async register(sucursalPublicId: string, payload: SpaceFormValues): Promise<{ data: unknown; message: string }> {
        const res = await apiService.post(`/spaces/${sucursalPublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async listBySucursal(sucursalPublicId: string): Promise<SpaceListItem[]> {
        const res = await apiService.get(`/sucursals/${sucursalPublicId}/spaces`);
        return res.data.data;
    }
}

export default SpaceService;
