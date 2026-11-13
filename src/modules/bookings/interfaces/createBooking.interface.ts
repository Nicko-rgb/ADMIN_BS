/**
 * Cómo llega el pago al registrar la reserva:
 *   PENDING → no se cobró nada · DEPOSIT → se cobró un adelanto · PAID → se cobró el total.
 */
export type BookingPaymentStatus = 'PENDING' | 'DEPOSIT' | 'PAID';

/** Concepto de cada movimiento: pago único, adelanto o saldo. */
export type PaymentConcept = 'FULL' | 'DEPOSIT' | 'BALANCE';

/** Estado de cobro de la reserva, derivado por el backend de sus pagos. */
export type BookingPaymentState = 'PENDING' | 'PARTIAL' | 'PAID';

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
    /** Solo se usa con `payment_status = DEPOSIT`. */
    deposit_amount: string;
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
    deposit_amount?: number;
    notes: string | null;
}

export interface BookingPaymentData {
    paymentId: number;
    concept: PaymentConcept;
    paymentTypeId: number;
    paymentTypeName: string | null;
    amount: string;
    currency: string;
    method: 'ONLINE' | 'IN_PERSON';
    status: 'PENDING' | 'AWAITING_APPROVAL' | 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED';
    paymentDate: string | null;
    createdAt: string;
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
    /** Cobrado y pendiente de la reserva, calculado por el backend. */
    paymentSummary: {
        currency: string | null;
        paidAmount: string;
        pendingAmount: string;
        status: BookingPaymentState;
    };
    /** Movimientos de dinero en orden de registro (adelanto, saldo o pago único). */
    payments: BookingPaymentData[];
}

/** Cobro posterior de una reserva — el saldo completo o una parte. */
export interface RegisterBookingPaymentForm {
    amount: string;
    payment_type_id: string;
}

export interface RegisterBookingPaymentPayload {
    amount: number;
    payment_type_id: number;
}

export interface CreateBookingContext {
    spacePublicId: string;
    spaceName: string;
    branchName: string;
    initialDate?: string;
    initialStartTime?: string;
    initialEndTime?: string;
}
