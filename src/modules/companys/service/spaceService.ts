import { apiService } from '../../../shared/utils/apiService';
import type { SpaceFormValues, SpaceListItem, SpaceDetail, SpaceMediaFile } from '../interfaces/space.interface';

// Espacios deportivos de una sucursal — por ahora alta y listado (el backend aún
// no expone edición); el payload usa los mismos nombres que space.schema.ts.
class SpaceService {
    static async register(sucursalPublicId: string, payload: SpaceFormValues): Promise<{ data: unknown; message: string }> {
        const res = await apiService.post(`/spaces/${sucursalPublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async listBySucursal(sucursalPublicId: string): Promise<SpaceListItem[]> {
        const res = await apiService.get(`/spaces/sucursals/${sucursalPublicId}/list`);
        return res.data.data;
    }

    static async spaceById(spacePublicId: string): Promise<SpaceDetail> {
        const res = await apiService.get(`/spaces/space/${spacePublicId}`);
        return res.data.data;
    }

    static async updateSpace(spacePublicId: string, payload: Partial<SpaceFormValues>): Promise<{ data: SpaceDetail; message: string }> {
        const res = await apiService.put(`/spaces/space/${spacePublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    // ── Galería multimedia del espacio ─────────────────────────────────────────
    /** Lista de archivos de la galería (imágenes y videos) del espacio. */
    static async getMedia(spacePublicId: string): Promise<SpaceMediaFile[]> {
        const res = await apiService.get(`/spaces/${spacePublicId}/gallery`);
        return res.data.data ?? [];
    }

    /** Sube un archivo a la galería y devuelve el registro creado + el mensaje del backend. */
    static async uploadMedia(spacePublicId: string, file: File, description?: string): Promise<{ data: SpaceMediaFile; message: string }> {
        const form = new FormData();
        form.append('media', file);
        if (description?.trim()) form.append('description', description.trim());
        const res = await apiService.post(`/spaces/${spacePublicId}/gallery`, form);
        return { data: res.data.data, message: res.data.message };
    }

    /** Elimina un archivo de la galería por su public_id. */
    static async removeMedia(spacePublicId: string, mediaPublicId: string): Promise<{ message: string }> {
        const res = await apiService.delete(`/spaces/${spacePublicId}/gallery/${mediaPublicId}`);
        return { message: res.data.message };
    }
}

export default SpaceService;
