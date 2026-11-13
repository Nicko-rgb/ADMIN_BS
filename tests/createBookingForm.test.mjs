import assert from 'node:assert/strict';
import { test } from 'node:test';
import { depositBalance, emptyBookingForm, toCreateBookingPayload, validateBookingForm } from '../src/modules/bookings/utils/createBookingForm.ts';
import { emptyPaymentForm, formatMoney, toPaymentPayload, validatePaymentForm } from '../src/modules/bookings/utils/bookingPaymentForm.ts';

const validForm = () => ({
    ...emptyBookingForm('2099-11-07'),
    first_name: ' Ana ', last_name: ' Pérez ', phone: ' +51 999888777 ',
    start_time: '18:00', end_time: '19:00', total_amount: '80.50', payment_type_id: '2',
});

test('el formulario mínimo no exige correo ni notas y produce el contrato de registro', () => {
    const form = validForm();
    assert.deepEqual(validateBookingForm(form), {});
    assert.deepEqual(toCreateBookingPayload(form), {
        client: { first_name: 'Ana', last_name: 'Pérez', phone: '+51 999888777', email: null },
        booking_date: '2099-11-07', start_time: '18:00', end_time: '19:00',
        total_amount: 80.5, payment_type_id: 2, payment_status: 'PENDING', notes: null,
    });
});

test('medianoche termina el día de reserva en vez de enviarse como hora anterior al inicio', () => {
    const form = { ...validForm(), start_time: '23:00', end_time: '00:00' };
    assert.deepEqual(validateBookingForm(form), {});
    const payload = toCreateBookingPayload(form);
    assert.equal(payload.end_time, '24:00');
    assert.equal(payload.booking_date, form.booking_date);
});

test('rechaza intervalos invertidos, horas vacías y fechas inexistentes', () => {
    for (const [field, value] of [
        ['end_time', '17:00'], ['end_time', '18:00'], ['start_time', ''],
        ['booking_date', '2099-02-30'], ['booking_date', ''], ['booking_date', '0000-01-01'],
    ]) assert.ok(validateBookingForm({ ...validForm(), [field]: value })[field]);
    assert.equal(validateBookingForm({ ...validForm(), booking_date: '2100-02-29' }).booking_date !== undefined, true);
    assert.equal(validateBookingForm({ ...validForm(), booking_date: '2096-02-29' }).booking_date, undefined);
});

test('no redondea silenciosamente precios con más de dos decimales ni admite importes inválidos', () => {
    for (const total_amount of ['', '0', '-1', '80.123', '100000000', 'Infinity', '1e2']) {
        assert.ok(validateBookingForm({ ...validForm(), total_amount }).total_amount, total_amount);
    }
    for (const total_amount of ['0.01', '80', '99999999.99']) {
        assert.equal(validateBookingForm({ ...validForm(), total_amount }).total_amount, undefined);
    }
});

test('exige datos del cliente y un tipo de pago; valida el correo cuando se proporciona', () => {
    for (const field of ['first_name', 'last_name', 'phone', 'payment_type_id']) {
        assert.ok(validateBookingForm({ ...validForm(), [field]: '' })[field]);
    }
    assert.ok(validateBookingForm({ ...validForm(), email: 'correo-invalido' }).email);
    assert.ok(validateBookingForm({ ...validForm(), phone: 'abc' }).phone);
    assert.ok(validateBookingForm({ ...validForm(), payment_type_id: '1.5' }).payment_type_id);
});

test('cada apertura empieza con nuevos datos y pago pendiente', () => {
    const previous = validForm();
    previous.payment_status = 'PAID';
    const fresh = emptyBookingForm('2099-11-08');
    assert.equal(fresh.booking_date, '2099-11-08');
    assert.equal(fresh.first_name, '');
    assert.equal(fresh.payment_type_id, '');
    assert.equal(fresh.payment_status, 'PENDING');
    const payload = toCreateBookingPayload({ ...previous, email: ' ana@example.com ', notes: ' Recibido en recepción ' });
    assert.equal(payload.client.email, 'ana@example.com');
    assert.equal(payload.notes, 'Recibido en recepción');
    assert.equal(payload.payment_status, 'PAID');
});

test('con adelanto exige un monto positivo menor al total y lo envía en el contrato', () => {
    const form = { ...validForm(), total_amount: '40', payment_status: 'DEPOSIT', deposit_amount: '10.50' };
    assert.deepEqual(validateBookingForm(form), {});
    assert.equal(depositBalance(form), '29.50');
    const payload = toCreateBookingPayload(form);
    assert.equal(payload.payment_status, 'DEPOSIT');
    assert.equal(payload.deposit_amount, 10.5);

    for (const deposit_amount of ['', '0', '40', '41', '10.123']) {
        assert.ok(validateBookingForm({ ...form, deposit_amount }).deposit_amount, deposit_amount);
    }
    assert.equal(depositBalance({ ...form, deposit_amount: '40' }), null);
});

test('sin adelanto no envía deposit_amount aunque el campo tenga texto', () => {
    const payload = toCreateBookingPayload({ ...validForm(), payment_status: 'PAID', deposit_amount: '10' });
    assert.equal('deposit_amount' in payload, false);
    assert.equal(validateBookingForm({ ...validForm(), payment_status: 'PENDING', deposit_amount: 'x' }).deposit_amount, undefined);
});

test('el cobro sugiere el saldo completo y no permite superarlo', () => {
    const form = emptyPaymentForm('29.5');
    assert.deepEqual(form, { amount: '29.50', payment_type_id: '' });
    assert.ok(validatePaymentForm(form, '29.50').payment_type_id);
    assert.deepEqual(validatePaymentForm({ ...form, payment_type_id: '3' }, '29.50'), {});
    assert.deepEqual(validatePaymentForm({ amount: '10', payment_type_id: '3' }, '29.50'), {});
    assert.match(validatePaymentForm({ amount: '29.51', payment_type_id: '3' }, '29.50').amount, /29\.50/);
    assert.ok(validatePaymentForm({ amount: '0', payment_type_id: '3' }, '29.50').amount);
    assert.deepEqual(toPaymentPayload({ amount: ' 10.5 ', payment_type_id: '3' }), { amount: 10.5, payment_type_id: 3 });
    assert.equal(formatMoney('20', 'PEN'), 'PEN 20.00');
});
