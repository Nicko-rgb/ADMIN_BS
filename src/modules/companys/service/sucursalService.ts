import { apiService } from '../../../shared/utils/apiService';
import type { SucursalDetail, SucursalPayload, EntityStatus } from '../interfaces/sucursal.interface';

export interface BannerFile {
    publicId: string;
    url: string;
    fileName: string;
    description: string | null;
}

// Alta y edición de sucursal — companyPublicId (alta) es el public_id de la empresa padre, publicId (detalle/edición) es el propio de la sucursal.
class SucursalService {
    static async register(companyPublicId: string, payload: SucursalPayload): Promise<{ data: SucursalDetail; message: string }> {
        const res = await apiService.post(`/sucursals/${companyPublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async getByPublicId(publicId: string): Promise<SucursalDetail> {
        const res = await apiService.get(`/sucursals/${publicId}`);
        return res.data.data;
    }

    static async update(publicId: string, payload: SucursalPayload): Promise<{ data: SucursalDetail; message: string }> {
        const res = await apiService.put(`/sucursals/${publicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    // Cambia el estado de la sucursal (ACTIVE | MAINTENANCE | INACTIVE)
    static toggleStatus(sucursalPublicId: string) {
        return async (status: EntityStatus): Promise<{ data: SucursalDetail; message: string }> => {
            const res = await apiService.patch(`/sucursals/${sucursalPublicId}/status`, { status });
            return { data: res.data.data, message: res.data.message };
        };
    }

    // Banner/portada — GET trae la actual o null, POST la reemplaza, DELETE la quita.
    static async getBanner(sucursalPublicId: string): Promise<BannerFile | null> {
        const res = await apiService.get(`/sucursals/${sucursalPublicId}/banner`);
        const data = res.data.data;
        return data ? { publicId: data.publicId, url: data.url, fileName: data.fileName, description: data.description ?? null } : null;
    }

    /**
     * Sube la portada. La operación queda bindeada a la sucursal — el que la
     * usa (MedibleImage) solo aporta el archivo y su descripción.
     */
    static uploadBanner(sucursalPublicId: string) {
        return async (file: File, description?: string): Promise<{ data: BannerFile; message: string }> => {
            const form = new FormData();
            form.append('cover', file);
            if (description) form.append('description', description);
            const res = await apiService.post(`/sucursals/${sucursalPublicId}/banner`, form);
            const data = res.data.data;
            return {
                data: { publicId: data.publicId, url: data.url, fileName: data.fileName, description: data.description ?? null },
                message: res.data.message,
            };
        };
    }

    /** Quita la portada. La operación queda bindeada a la sucursal. */
    static removeBanner(sucursalPublicId: string) {
        return async (): Promise<{ message: string }> => {
            const res = await apiService.delete(`/sucursals/${sucursalPublicId}/banner`);
            return { message: res.data.message };
        };
    }
}

export default SucursalService;
