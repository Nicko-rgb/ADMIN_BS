import { apiService } from '../../../shared/utils/apiService';
import type {
    PaymentConfigPaymentType, ManualPaymentAccount, ManualPaymentAccountFormValues,
    RegisterMercadoPagoPayload,
} from '../interfaces/paymentConfig.interface';

/**
 * Datos de Configuración de pagos.
 *
 * El árbol empresa → sucursales sale de `shared/service/contextService`
 * (misma fuente que el login), así que la pantalla no depende de
 * `company.view`/`sucursal.view`. Sin try/catch: los errores los maneja el hook.
 */
class PaymentConfigService {
    static async listManualAccounts(branchId: string): Promise<ManualPaymentAccount[]> {
        const res = await apiService.get(`/payment-config/${branchId}/manual-accounts`);
        return res.data.data;
    }

    static async getManualAccount(branchId: string, typeId: number): Promise<ManualPaymentAccount | null> {
        const res = await apiService.get(`/payment-config/${branchId}/manual-accounts/${typeId}`);
        return res.data.data;
    }

    static async saveManualAccount(branchId: string, typeId: number, payload: ManualPaymentAccountFormValues, qrFile: File | null, removeQr: boolean): Promise<ManualPaymentAccount> {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => data.append(key, value));
        data.append('remove_qr', String(removeQr));
        if (qrFile) data.append('account_qr', qrFile);
        const res = await apiService.put(`/payment-config/${branchId}/manual-accounts/${typeId}`, data);
        return res.data.data;
    }

    static async deleteManualAccount(branchId: string, typeId: number): Promise<void> {
        await apiService.delete(`/payment-config/${branchId}/manual-accounts/${typeId}`);
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
