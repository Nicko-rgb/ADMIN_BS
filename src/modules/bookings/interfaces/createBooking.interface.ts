export type BookingPaymentStatus = 'PENDING' | 'PAID';

export interface CreateBookingForm {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_amount: string;
    payment_type_id: string;
    payment_status: BookingPaymentStatus;
    notes: string;
}

export interface CreateBookingPayload {
    client: { first_name: string; last_name: string; phone: string; email: string | null };
    booking_date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    payment_type_id: number;
    payment_status: BookingPaymentStatus;
    notes: string | null;
}

export interface BookingData {
    bookingId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number | null;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW' | 'REJECTED';
    totalAmount: string;
    notes: string | null;
    createdAt: string;
    client: { publicId: string; firstName: string | null; lastName: string | null; phone: string | null; email: string | null } | null;
    payment: {
        paymentId: number;
        paymentTypeId: number;
        amount: string;
        currency: string;
        method: 'ONLINE' | 'IN_PERSON';
        status: 'PENDING' | 'AWAITING_APPROVAL' | 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED';
        paymentDate: string | null;
    } | null;
}

export interface CreateBookingContext {
    spacePublicId: string;
    spaceName: string;
    branchName: string;
    initialDate?: string;
    initialStartTime?: string;
    initialEndTime?: string;
}
