import { apiService } from '../../../shared/utils/apiService';
import type { SucursalConfig, SucursalConfigPayload } from '../interfaces/sucursalConfig.interface';

// Configuración operativa de una sucursal — endpoint propio para no recargar la página
// de la sucursal. GET 404 = todavía no tiene config. PUT es upsert: crea si no existe,
// actualiza si existe. Sin try/catch: los errores los maneja el hook.
class SucursalConfigService {
    static async get(sucursalPublicId: string): Promise<SucursalConfig> {
        const res = await apiService.get(`/sucursal-configurations/${sucursalPublicId}`);
        return res.data.data as SucursalConfig;
    }

    static async save(sucursalPublicId: string, payload: SucursalConfigPayload): Promise<{ data: SucursalConfig; message: string }> {
        const res = await apiService.put(`/sucursal-configurations/${sucursalPublicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default SucursalConfigService;
