import { CalendarDays, HandCoins, History, RefreshCw, Wallet, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { FormActions, FormRow, FormSection, InputField, SelectField } from '../../../shared/components/FormComponents';
import { Modal } from '../../../shared/components/Modal';
import useBookingPayment from '../hooks/useBookingPayment';
import { BOOKING_STATUS_LABELS } from '../utils/calendarBookings';
import { PAYMENT_CONCEPT_LABELS, PAYMENT_STATE_LABELS, formatMoney } from '../utils/bookingPaymentForm';
import type { BookingData } from '../interfaces/createBooking.interface';
import '../styles/BookingDetail.css';

interface BookingDetailProps {
    booking: BookingData;
    spaceName: string;
    branchName: string;
    onClose: () => void;
}

const formatDateTime = (value: string | null): string => value
    ? new Date(value).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

// Por qué no se puede cobrar un saldo pendiente: la reserva está cerrada o falta el permiso.
const blockedCollectionHint = (status: BookingData['status']): string => (status === 'PENDING' || status === 'CONFIRMED')
    ? 'No tienes permiso para registrar pagos (payment.confirmed).'
    : `La reserva está ${BOOKING_STATUS_LABELS[status].toLowerCase()}: ya no admite pagos.`;

/** Detalle de una reserva: cuánto se cobró, cuánto falta y el cobro del saldo en la cancha. */
export const BookingDetail = ({ booking: initialBooking, spaceName, branchName, onClose }: BookingDetailProps) => {
    const {
        booking, form, setField, errors, handleSubmit, close, isSubmitting, submitError,
        canCollect, hasPending, paymentOptions, isLoadingPaymentTypes, retryPaymentTypes,
    } = useBookingPayment(initialBooking, onClose);

    const { currency, paidAmount, pendingAmount, status: paymentState } = booking.paymentSummary;
    const clientName = [booking.client?.firstName, booking.client?.lastName].filter(Boolean).join(' ') || 'Sin nombre';

    return (
        <Modal isOpen onClose={close} title={clientName} description={`${branchName} · ${spaceName}`} icon={Wallet} isLoading={isSubmitting}>
            <div className="booking_detail">
                <FormSection title="Reserva" icon={CalendarDays}>
                    <dl className="booking_detail_facts">
                        <div><dt>Fecha</dt><dd>{booking.bookingDate}</dd></div>
                        <div><dt>Horario</dt><dd>{booking.startTime}–{booking.endTime}</dd></div>
                        <div><dt>Estado</dt><dd>{BOOKING_STATUS_LABELS[booking.status]}</dd></div>
                        <div><dt>Teléfono</dt><dd>{booking.client?.phone || '—'}</dd></div>
                    </dl>
                    {booking.notes && <p className="booking_detail_notes">{booking.notes}</p>}
                </FormSection>

                <div className={`booking_detail_totals is_${paymentState.toLowerCase()}`} role="status">
                    <div><span>Total</span><strong>{formatMoney(booking.totalAmount, currency)}</strong></div>
                    <div><span>Pagado</span><strong>{formatMoney(paidAmount, currency)}</strong></div>
                    <div className="is_pending"><span>Pendiente</span><strong>{formatMoney(pendingAmount, currency)}</strong></div>
                    <p className="booking_detail_state">{PAYMENT_STATE_LABELS[paymentState]}</p>
                </div>

                <FormSection title="Pagos" icon={History}>
                    {booking.payments.length === 0 ? (
                        <p className="booking_detail_empty">Sin pagos registrados.</p>
                    ) : (
                        <ul className="booking_detail_payments">
                            {booking.payments.map((payment) => (
                                <li key={payment.paymentId} className={payment.status === 'PAID' ? 'is_paid' : 'is_pending'}>
                                    <div>
                                        <strong>{PAYMENT_CONCEPT_LABELS[payment.concept] ?? payment.concept}</strong>
                                        <span>{payment.status === 'PAID'
                                            ? `${payment.paymentTypeName ?? 'Pago'} · ${formatDateTime(payment.paymentDate)}`
                                            : 'Por cobrar'}</span>
                                    </div>
                                    <strong>{formatMoney(payment.amount, payment.currency)}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </FormSection>

                {canCollect && (
                    <form className="booking_detail_collect" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                        <FormSection title="Registrar pago" icon={HandCoins}>
                            <fieldset disabled={isSubmitting}>
                                <FormRow>
                                    <InputField name="booking_collect_amount" label="Monto recibido" type="number" inputMode="decimal" min="0.01" step="0.01" value={form.amount} onChange={(e) => setField('amount')(e.target.value)} placeholder="0.00" required error={errors.amount} />
                                    <SelectField name="booking_collect_payment_type" label="Tipo de pago" value={form.payment_type_id} onChange={(e) => setField('payment_type_id')(String(e.target.value))} options={paymentOptions} placeholder={isLoadingPaymentTypes ? 'Cargando tipos de pago…' : 'Selecciona un tipo de pago'} disabled={isSubmitting || isLoadingPaymentTypes} required error={errors.payment_type_id} />
                                </FormRow>
                                {!isLoadingPaymentTypes && paymentOptions.length === 0 && (
                                    <div className="booking_detail_feedback" role="status">
                                        <span>No hay tipos de pago disponibles.</span>
                                        <Button type="button" text="Reintentar" icon={RefreshCw} color="secondary" size="sm" onClick={() => void retryPaymentTypes()} />
                                    </div>
                                )}
                                <p className="booking_detail_hint">Puedes cobrar todo el saldo o solo una parte; lo que falte seguirá pendiente.</p>
                            </fieldset>
                        </FormSection>
                        {submitError && <p className="booking_detail_error" role="alert">{submitError}</p>}
                        <FormActions>
                            <Button text="Cerrar" icon={X} size="lg" color="secondary" type="button" onClick={close} disabled={isSubmitting} />
                            <Button text="Registrar pago" icon={HandCoins} size="lg" type="submit" loading={isSubmitting} disabled={isLoadingPaymentTypes || paymentOptions.length === 0} />
                        </FormActions>
                    </form>
                )}

                {!canCollect && (
                    <>
                        {hasPending && <p className="booking_detail_hint">{blockedCollectionHint(booking.status)}</p>}
                        <FormActions>
                            <Button text="Cerrar" icon={X} size="lg" color="secondary" type="button" onClick={close} />
                        </FormActions>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default BookingDetail;
