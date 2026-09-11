import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CompanyAdmin, CompanyDetail, CompanyEnabled, UpdateCompanyPayload } from '../interfaces/company.interface';
import type { RegisterCompanyPayload } from '../interfaces/companyRegistration.interface';

// Catálogo de empresas principales del sistema — listado paginado, con búsqueda por nombre o documento y filtros por país y estado.
class CompanyService {
    static async list(page: number, limit: number, search?: string, countryId?: number, isEnabled?: CompanyEnabled | ''): Promise<PaginatedResponse<CompanyAdmin>> {
        const res = await apiService.get('/companys', { params: { page, limit, search: search || undefined, countryId: countryId || undefined, isEnabled: isEnabled || undefined } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Alta de empresa (wizard de 3 pasos) — queda activa de una, sin comunicarse con MercadoPago.
    static async register(payload: RegisterCompanyPayload): Promise<{ data: CompanyAdmin; message: string }> {
        const res = await apiService.post('/companys/register', payload);
        return { data: res.data.data, message: res.data.message };
    }

    // Detalle de una empresa — se busca por tenantId, nunca por el id secuencial.
    static async getByTenantId(tenantId: string): Promise<CompanyDetail> {
        const res = await apiService.get(`/companys/${tenantId}`);
        return res.data.data;
    }

    // Autoedición de la propia empresa — sin `document` (RUC).
    static async updateByTenantId(tenantId: string, payload: UpdateCompanyPayload): Promise<{ data: CompanyDetail; message: string }> {
        const res = await apiService.put(`/companys/${tenantId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default CompanyService;
