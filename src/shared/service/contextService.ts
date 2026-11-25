import { apiService } from '../utils/apiService';
import type { CompanyContextData } from '../interfaces/session.interface';

/**
 * Contexto de empresa: empresa → sucursales → espacios, moneda, ventana
 * operativa y plan actual.
 *
 * Es la única fuente de verdad del contexto (la misma que usa el login) y vive
 * en `shared` porque lo consumen varios módulos. `entityPublicId` puede ser el
 * `public_id` de una empresa o de una sucursal: el backend resuelve el tenant y
 * devuelve el árbol completo con `access` por nodo.
 */
class ContextService {
    static async getContext(entityPublicId: string): Promise<CompanyContextData> {
        const res = await apiService.get(`/companys/public/branches/${encodeURIComponent(entityPublicId)}/tree`);
        return res.data.data;
    }
}

export default ContextService;
