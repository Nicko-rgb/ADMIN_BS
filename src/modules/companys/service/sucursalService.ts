import { apiService } from '../../../shared/utils/apiService';
import type { SucursalDetail, SucursalPayload } from '../interfaces/sucursal.interface';

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
}

export default SucursalService;
