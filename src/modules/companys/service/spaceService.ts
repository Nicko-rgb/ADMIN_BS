import { apiService } from '../../../shared/utils/apiService';
import type { SpaceFormValues, SpaceListItem, SpaceDetail, SpaceMediaFile } from '../interfaces/space.interface';
import type { EntityStatus } from '../interfaces/sucursal.interface';

// Espacios deportivos de una sucursal — por ahora alta y listado (el backend aún
// no expone edición); el payload usa los mismos nombres que space.schema.ts.
class SpaceService {
    static async register(sucursalPublicId: string, payload: SpaceFormValues): Promise<{ data: unknown; message: string }> {
        const res = await apiService.post(`/spaces/${sucursalPublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async listBySucursal(sucursalPublicId: string): Promise<SpaceListItem[]> {
        const res = await apiService.get(`/spaces/sucursals/${sucursalPublicId}/list-spaces`);
        return res.data.data;
    }

    static async spaceById(spacePublicId: string): Promise<{data: SpaceDetail, message: string }> {
        const res = await apiService.get(`/spaces/space/${spacePublicId}/data-space`);
        return {data: res.data.data, message: res.data.message};
    }

    static async updateSpace(spacePublicId: string, payload: Partial<SpaceFormValues>): Promise<{ data: SpaceDetail; message: string }> {
        const res = await apiService.put(`/spaces/space/${spacePublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    // Cambia el estado del espacio (ACTIVE | MAINTENANCE | INACTIVE)
    static toggleStatus(spacePublicId: string) {
        return async (status: EntityStatus): Promise<{ data: SpaceDetail; message: string }> => {
            const res = await apiService.patch(`/spaces/space/${spacePublicId}/status`, { status });
            return { data: res.data.data, message: res.data.message };
        };
    }


    // ── Galería multimedia del espacio ─────────────────────────────────────────
    /** Lista de archivos de la galería (imágenes y videos) del espacio. */
    static async getMedia(spacePublicId: string): Promise<SpaceMediaFile[]> {
        const res = await apiService.get(`/spaces/space/${spacePublicId}/gallerys-space`);
        return res.data.data ?? [];
    }

    // Sube un archivo a la galería. La operación queda bindeada al espacio
    static uploadMedia(spacePublicId: string) {
        return async (file: File, description?: string): Promise<{ data: SpaceMediaFile; message: string }> => {
            const form = new FormData();
            form.append('media', file);
            if (description) form.append('description', description);
            const res = await apiService.post(`/spaces/space/${spacePublicId}/gallery`, form);
            return { data: res.data.data, message: res.data.message };
        };
    }

    // Elimina un archivo de la galería. La operación queda bindeada al espacio
    static removeMedia(spacePublicId: string) {
        return async (mediaPublicId: string): Promise<{ message: string }> => {
            const res = await apiService.delete(`/spaces/space/${spacePublicId}/gallery/${mediaPublicId}`);
            return { message: res.data.message };
        };
    }
}

export default SpaceService;
