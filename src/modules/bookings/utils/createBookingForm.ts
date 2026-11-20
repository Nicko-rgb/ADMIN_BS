import type { FormErrors } from '../../../shared/utils/formErrors';
import type { CreateBookingForm, CreateBookingPayload } from '../interfaces/createBooking.interface';
// Con extensión: los tests (tests/*.test.mjs) cargan este archivo directo con Node.
import { formatCents, parseAmountCents } from './bookingPaymentForm.ts';

export const emptyBookingForm = (date = '', startTime = '', endTime = ''): CreateBookingForm => ({
    first_name: '', last_name: '', phone: '', email: '', booking_date: date,
    start_time: startTime, end_time: endTime, total_amount: '', payment_type_id: '',
    payment_status: 'PENDING', deposit_amount: '', notes: '',
});

/** Saldo que queda por cobrar en la cancha, o null si total/adelanto aún no son válidos. */
export const depositBalance = (form: CreateBookingForm): string | null => {
    const total = parseAmountCents(form.total_amount);
    const deposit = parseAmountCents(form.deposit_amount);
    return total !== null && deposit !== null && deposit < total ? formatCents(total - deposit) : null;
};

// El input time representa medianoche como 00:00; el backend usa 24:00 al cerrar el día.
export const bookingEndTime = (value: string) => value === '00:00' ? '24:00' : value;

export const validateBookingForm = (form: CreateBookingForm): FormErrors<CreateBookingForm> => {
    const errors: FormErrors<CreateBookingForm> = {};
    for (const field of ['first_name', 'last_name'] as const) {
        const value = form[field].trim();
        if (value.length < 2 || value.length > 100) errors[field] = 'Ingresa entre 2 y 100 caracteres';
    }
    const phone = form.phone.trim();
    if (!/^\+?[0-9][0-9 ()-]*$/.test(phone) || phone.length > 20) errors.phone = 'Ingresa un teléfono válido (máximo 20 caracteres)';
    const email = form.email.trim();
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100)) errors.email = 'Ingresa un correo válido';

    const date = new Date(`${form.booking_date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.booking_date) || !Number.isFinite(date.getTime())
        || form.booking_date.startsWith('0000-') || date.toISOString().slice(0, 10) !== form.booking_date) {
        errors.booking_date = 'Selecciona una fecha válida';
    }
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(form.start_time)) errors.start_time = 'Selecciona la hora de inicio';
    if (!timePattern.test(form.end_time)) errors.end_time = 'Selecciona la hora de fin';
    if (!errors.start_time && !errors.end_time && bookingEndTime(form.end_time) <= form.start_time) {
        errors.end_time = 'La hora de fin debe ser posterior al inicio';
    }

    const total = parseAmountCents(form.total_amount);
    if (total === null) errors.total_amount = 'Ingresa un precio positivo con hasta 2 decimales';
    if (form.payment_status === 'DEPOSIT') {
        const deposit = parseAmountCents(form.deposit_amount);
        if (deposit === null) errors.deposit_amount = 'Ingresa un adelanto positivo con hasta 2 decimales';
        else if (total !== null && deposit >= total) errors.deposit_amount = 'El adelanto debe ser menor al precio total; si se cobró todo, elige "Pago completo"';
    }
    if (!Number.isSafeInteger(Number(form.payment_type_id)) || Number(form.payment_type_id) <= 0) errors.payment_type_id = 'Selecciona un tipo de pago';
    if (form.notes.trim().length > 2000) errors.notes = 'Máximo 2000 caracteres';
    return errors;
};

export const toCreateBookingPayload = (form: CreateBookingForm): CreateBookingPayload => ({
    client: {
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        phone: form.phone.trim(), email: form.email.trim() || null,
    },
    booking_date: form.booking_date,
    start_time: form.start_time,
    end_time: bookingEndTime(form.end_time),
    total_amount: Number(form.total_amount),
    payment_type_id: Number(form.payment_type_id),
    payment_status: form.payment_status,
    ...(form.payment_status === 'DEPOSIT' ? { deposit_amount: Number(form.deposit_amount.trim()) } : {}),
    notes: form.notes.trim() || null,
});
