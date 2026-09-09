import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreatePaymentTypePayload, PaymentType, UpdatePaymentTypePayload } from '../interfaces/catalog.interface';

// Catálogo de tipos de pago — un método por endpoint.
class PaymentTypeService {
    static async list(page: number, limit: number): Promise<PaginatedResponse<PaymentType>> {
        const res = await apiService.get('/system/payment-types', { params: { page, limit } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Solo habilitados, sin paginar — endpoint público, para selects/lógica de negocio en toda la app.
    static async listActive(): Promise<PaymentType[]> {
        const res = await apiService.get('/system/payment-types/active');
        return res.data.data;
    }

    static async create(payload: CreatePaymentTypePayload): Promise<{ data: PaymentType; message: string }> {
        const res = await apiService.post('/system/payment-types', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdatePaymentTypePayload): Promise<{ data: PaymentType; message: string }> {
        const res = await apiService.put(`/system/payment-types/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/payment-types/${id}`);
        return { message: res.data.message };
    }
}

export default PaymentTypeService;
