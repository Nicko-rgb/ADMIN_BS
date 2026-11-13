import { apiService } from '../../../shared/utils/apiService';
import type { BookingData, CreateBookingPayload, RegisterBookingPaymentPayload } from '../interfaces/createBooking.interface';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { BookingDateRange } from '../interfaces/booking.interface';
import { loadBookingPages } from '../utils/loadBookingPages';

class BookingService {
    static async listBySpace(spacePublicId: string, range: BookingDateRange, page = 1, signal?: AbortSignal): Promise<PaginatedResponse<BookingData>> {
        const res = await apiService.get(`/bookings/admin/spaces/${encodeURIComponent(spacePublicId)}`, {
            params: { ...range, page, limit: 100 }, signal,
        });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    static listByRange(spacePublicId: string, range: BookingDateRange, signal?: AbortSignal): Promise<BookingData[]> {
        return loadBookingPages((page) => BookingService.listBySpace(spacePublicId, range, page, signal), signal);
    }

    static async register(spacePublicId: string, payload: CreateBookingPayload): Promise<{ data: BookingData; message: string }> {
        const res = await apiService.post(`/bookings/admin/spaces/${encodeURIComponent(spacePublicId)}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    /** Cobro posterior (ej. el saldo en la cancha). Devuelve la reserva con sus pagos actualizados. */
    static async registerPayment(bookingId: number, payload: RegisterBookingPaymentPayload): Promise<{ data: BookingData; message: string }> {
        const res = await apiService.post(`/bookings/admin/bookings/${encodeURIComponent(bookingId)}/payments`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default BookingService;
