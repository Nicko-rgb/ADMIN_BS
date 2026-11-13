import type { FormErrors } from '../../../shared/utils/formErrors';
import type {
    BookingPaymentState, BookingPaymentStatus, PaymentConcept,
    RegisterBookingPaymentForm, RegisterBookingPaymentPayload,
} from '../interfaces/createBooking.interface';

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_AMOUNT_CENTS = 9999999999;

/** Importe escrito por el usuario → céntimos enteros; null si no es un importe positivo válido (máx. 2 decimales). */
export const parseAmountCents = (value: string): number | null => {
    const text = value.trim();
    if (!AMOUNT_PATTERN.test(text)) return null;
    const cents = Math.round(Number(text) * 100);
    return cents > 0 && cents <= MAX_AMOUNT_CENTS ? cents : null;
};

export const toCents = (amount: string | number): number => Math.round(Number(amount) * 100);
export const formatCents = (cents: number): string => (cents / 100).toFixed(2);

/** Importe con su moneda para mostrar ("PEN 40.00"). */
export const formatMoney = (amount: string | number, currency: string | null | undefined): string =>
    `${currency ?? ''} ${formatCents(toCents(amount))}`.trim();

export const INITIAL_PAYMENT_OPTIONS: { value: BookingPaymentStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente (no se cobró nada)' },
    { value: 'DEPOSIT', label: 'Adelanto' },
    { value: 'PAID', label: 'Pago completo' },
];

export const PAYMENT_STATE_LABELS: Record<BookingPaymentState, string> = {
    PENDING: 'Pago pendiente', PARTIAL: 'Adelanto pagado', PAID: 'Pagado',
};

export const PAYMENT_CONCEPT_LABELS: Record<PaymentConcept, string> = {
    FULL: 'Pago total', DEPOSIT: 'Adelanto', BALANCE: 'Saldo',
};

/** Cobro posterior: el formulario empieza con el saldo completo como monto sugerido. */
export const emptyPaymentForm = (pendingAmount: string): RegisterBookingPaymentForm => ({
    amount: toCents(pendingAmount) > 0 ? formatCents(toCents(pendingAmount)) : '',
    payment_type_id: '',
});

export const validatePaymentForm = (form: RegisterBookingPaymentForm, pendingAmount: string): FormErrors<RegisterBookingPaymentForm> => {
    const errors: FormErrors<RegisterBookingPaymentForm> = {};
    const cents = parseAmountCents(form.amount);
    const pending = toCents(pendingAmount);
    if (cents === null) errors.amount = 'Ingresa un monto positivo con hasta 2 decimales';
    else if (cents > pending) errors.amount = `El monto no puede superar el saldo pendiente (${formatCents(pending)})`;
    if (!Number.isSafeInteger(Number(form.payment_type_id)) || Number(form.payment_type_id) <= 0) {
        errors.payment_type_id = 'Selecciona un tipo de pago';
    }
    return errors;
};

export const toPaymentPayload = (form: RegisterBookingPaymentForm): RegisterBookingPaymentPayload => ({
    amount: Number(form.amount.trim()),
    payment_type_id: Number(form.payment_type_id),
});
