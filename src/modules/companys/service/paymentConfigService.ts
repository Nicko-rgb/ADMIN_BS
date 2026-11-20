import { apiService } from '../../../shared/utils/apiService';
import type { CompanyDetail, CompanySubsidiary } from '../interfaces/company.interface';
import type {
    PaymentConfigPaymentType,
    RegisterMercadoPagoPayload,
} from '../interfaces/paymentConfig.interface';

/**
 * Datos de Configuración de pagos.
 *
 * Empresa, sucursales y catálogo de tipos de pago por país, más el registro de
 * la credencial de Mercado Pago de una sucursal. Sin try/catch: los errores los
 * maneja el hook.
 */
class PaymentConfigService {
    static async getCompany(publicId: string): Promise<CompanyDetail> {
        const res = await apiService.get(`/companys/${publicId}`);
        return res.data.data;
    }

    static async listBranches(companyPublicId: string): Promise<CompanySubsidiary[]> {
        const res = await apiService.get(`/sucursals/company/${companyPublicId}/branches`);
        return res.data.data;
    }

    // Tipos activos del país de la sucursal + los globales (country_id null).
    static async listPaymentTypesByCountry(countryId: number): Promise<PaymentConfigPaymentType[]> {
        const res = await apiService.get(`/system/payment-types/${countryId}/payment-country`);
        return res.data.data;
    }

    // Upsert por sucursal: si ya tenía una cuenta conectada, la reemplaza.
    static async registerMercadoPago(
        sucursalPublicId: string,
        payload: RegisterMercadoPagoPayload,
    ): Promise<string> {
        const res = await apiService.post(`/payment-config/${sucursalPublicId}/mercadopago-credential`, payload);
        return res.data.message;
    }

    // Solo estado: true si la sucursal ya tiene Mercado Pago conectado.
    static async getMercadoPagoStatus(sucursalPublicId: string): Promise<boolean> {
        const res = await apiService.get(`/payment-config/${sucursalPublicId}/mercadopago-credential`);
        return Boolean(res.data.data?.connected);
    }

    // Desconecta la cuenta: el backend elimina la credencial de la sucursal.
    static async disconnectMercadoPago(sucursalPublicId: string): Promise<string> {
        const res = await apiService.delete(`/payment-config/${sucursalPublicId}/mercadopago-credential`);
        return res.data.message;
    }
}

export default PaymentConfigService;
