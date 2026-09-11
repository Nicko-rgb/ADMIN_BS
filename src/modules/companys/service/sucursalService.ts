import { apiService } from '../../../shared/utils/apiService';
import type { SucursalDetail, SucursalPayload } from '../interfaces/sucursal.interface';

// Alta y edición de sucursal — companyTenantId (alta) es el tenant_id de la empresa padre, tenantId (detalle/edición) es el propio de la sucursal.
class SucursalService {
    static async register(companyTenantId: string, payload: SucursalPayload): Promise<{ data: SucursalDetail; message: string }> {
        const res = await apiService.post(`/sucursals/${companyTenantId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async getByTenantId(tenantId: string): Promise<SucursalDetail> {
        const res = await apiService.get(`/sucursals/${tenantId}`);
        return res.data.data;
    }

    static async update(tenantId: string, payload: SucursalPayload): Promise<{ data: SucursalDetail; message: string }> {
        const res = await apiService.put(`/sucursals/${tenantId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default SucursalService;
