import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CompanyAdmin, CompanyEnabled } from '../interfaces/company.interface';
import type { RegisterCompanyPayload } from '../interfaces/companyRegistration.interface';

// Catálogo de empresas principales del sistema — listado paginado, con búsqueda por nombre o documento y filtros por país y estado.
class CompanyService {
    static async list(page: number, limit: number, search?: string, countryId?: number, isEnabled?: CompanyEnabled | ''): Promise<PaginatedResponse<CompanyAdmin>> {
        const res = await apiService.get('/companys', { params: { page, limit, search: search || undefined, countryId: countryId || undefined, isEnabled: isEnabled || undefined } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Alta de empresa (wizard de 3 pasos) — queda pendiente de pago; paymentUrl es el link de
    // MercadoPago que también se le manda por correo al dueño.
    static async register(payload: RegisterCompanyPayload): Promise<{ data: CompanyAdmin; message: string; paymentUrl: string | null }> {
        const res = await apiService.post('/companys/register', payload);
        return { data: res.data.data, message: res.data.message, paymentUrl: res.data.paymentUrl };
    }
}

export default CompanyService;
