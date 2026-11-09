import { CalendarPlus, Clock, CreditCard, RefreshCw, UserRound, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { FormActions, FormRow, FormSection, InputField, SelectField, TextAreaField, ToggleField } from '../../../shared/components/FormComponents';
import { Modal } from '../../../shared/components/Modal';
import useCreateBooking from '../hooks/useCreateBooking';
import type { BookingData, CreateBookingContext } from '../interfaces/createBooking.interface';
import '../styles/CreateBooking.css';

interface CreateBookingProps extends CreateBookingContext {
    onClose: () => void;
    onCreated?: (booking: BookingData) => void;
}

/** Se monta al abrir: cada nueva reserva empieza con un formulario limpio. */
export const CreateBooking = ({ spaceName, branchName, ...args }: CreateBookingProps) => {
    const {
        form, setField, errors, handleSubmit, close, isSubmitting, submitError,
        canCreate, canConfirmPayment, paymentOptions, isLoadingPaymentTypes, retryPaymentTypes,
    } = useCreateBooking(args);

    return (
        <Modal isOpen onClose={close} title="Nueva reserva" description={`${branchName} · ${spaceName}`} icon={CalendarPlus} isLoading={isSubmitting}>
            <form className="create_booking_form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                <fieldset disabled={isSubmitting}>
                    <FormSection title="Datos del reservador" icon={UserRound}>
                        <FormRow>
                            <InputField name="booking_first_name" label="Nombres" value={form.first_name} onChange={(e) => setField('first_name')(e.target.value)} autoComplete="given-name" maxLength={100} required error={errors.first_name} />
                            <InputField name="booking_last_name" label="Apellidos" value={form.last_name} onChange={(e) => setField('last_name')(e.target.value)} autoComplete="family-name" maxLength={100} required error={errors.last_name} />
                        </FormRow>
                        <FormRow>
                            <InputField name="booking_phone" label="Teléfono" type="tel" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} autoComplete="tel" maxLength={20} required error={errors.phone} />
                            <InputField name="booking_email" label="Correo (opcional)" type="email" value={form.email} onChange={(e) => setField('email')(e.target.value)} autoComplete="email" maxLength={100} error={errors.email} />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Detalles de la reserva" icon={Clock}>
                        <FormRow>
                            <InputField name="booking_date" label="Fecha de reserva" type="date" value={form.booking_date} onChange={(e) => setField('booking_date')(e.target.value)} required error={errors.booking_date} />
                            <InputField name="booking_price" label="Precio total" type="number" inputMode="decimal" min="0.01" max="99999999.99" step="0.01" value={form.total_amount} onChange={(e) => setField('total_amount')(e.target.value)} placeholder="0.00" required error={errors.total_amount} />
                        </FormRow>
                        <FormRow>
                            <InputField name="booking_start_time" label="Hora de inicio" type="time" value={form.start_time} onChange={(e) => setField('start_time')(e.target.value)} required error={errors.start_time} />
                            <InputField name="booking_end_time" label="Hora de fin" type="time" value={form.end_time} onChange={(e) => setField('end_time')(e.target.value)} required error={errors.end_time} />
                        </FormRow>
                        <p className="booking_form_hint">Para terminar a medianoche, selecciona 00:00 en la hora de fin.</p>
                    </FormSection>

                    <FormSection title="Pago" icon={CreditCard}>
                        <FormRow>
                            <SelectField name="booking_payment_type" label="Tipo de pago" value={form.payment_type_id} onChange={(e) => setField('payment_type_id')(String(e.target.value))} options={paymentOptions} placeholder={isLoadingPaymentTypes ? 'Cargando tipos de pago…' : 'Selecciona un tipo de pago'} disabled={isSubmitting || isLoadingPaymentTypes} required error={errors.payment_type_id} />
                        </FormRow>
                        {!isLoadingPaymentTypes && paymentOptions.length === 0 && (
                            <div className="booking_form_feedback" role="status">
                                <span>No hay tipos de pago disponibles.</span>
                                <Button type="button" text="Reintentar" icon={RefreshCw} color="secondary" size="sm" onClick={() => void retryPaymentTypes()} disabled={isSubmitting} />
                            </div>
                        )}
                        {canConfirmPayment && (
                            <ToggleField name="booking_payment_paid" label="Pago recibido" checked={form.payment_status === 'PAID'} onChange={(e) => setField('payment_status')(e.target.checked ? 'PAID' : 'PENDING')} disabled={isSubmitting} />
                        )}
                        <p className="booking_form_hint">{form.payment_status === 'PAID' ? 'El pago se registrará como pagado.' : 'El pago quedará pendiente.'}</p>
                    </FormSection>

                    <FormRow>
                        <TextAreaField name="booking_notes" label="Notas (opcional)" value={form.notes} onChange={(e) => setField('notes')(e.target.value)} rows={2} maxLength={2000} error={errors.notes} />
                    </FormRow>
                </fieldset>

                {submitError && <p className="booking_form_error" role="alert">{submitError}</p>}
                {!canCreate && <p className="booking_form_error" role="alert">No tienes permisos para registrar reservas manuales.</p>}
                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={close} disabled={isSubmitting} />
                    <Button text="Crear reserva" icon={CalendarPlus} size="lg" type="submit" loading={isSubmitting} disabled={!canCreate || isLoadingPaymentTypes || paymentOptions.length === 0} />
                </FormActions>
            </form>
        </Modal>
    );
};

export default CreateBooking;
