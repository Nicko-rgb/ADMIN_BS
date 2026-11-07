import { CalendarPlus, Clock, UserRound, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { FormActions, FormRow, FormSection } from '../../../shared/components/FormComponents';
import { Modal } from '../../../shared/components/Modal';

interface CreateBookingProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Maqueta del formulario: campos sin estado ni lógica de creación de reservas. */
export const CreateBooking = ({ isOpen, onClose }: CreateBookingProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva reserva" icon={CalendarPlus}>
        <form onSubmit={(event) => event.preventDefault()}>
            <FormSection title="Datos del reservador" icon={UserRound}>
                <FormRow>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_reserver_name">Nombre completo</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_reserver_name" name="reserver_name" type="text" placeholder="Nombre y apellidos" autoComplete="name" />
                        </div>
                    </div>
                </FormRow>
                <FormRow>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_phone">Teléfono</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_phone" name="phone" type="tel" placeholder="Número de contacto" autoComplete="tel" />
                        </div>
                    </div>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_email">Correo electrónico</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_email" name="email" type="email" placeholder="correo@ejemplo.com" autoComplete="email" />
                        </div>
                    </div>
                </FormRow>
            </FormSection>

            <FormSection title="Detalles de la reserva" icon={Clock}>
                <FormRow>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_date">Fecha de reserva</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_date" name="date" type="date" />
                        </div>
                    </div>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_price">Precio</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_price" name="price" type="number" inputMode="decimal" step="0.01" placeholder="0.00" />
                        </div>
                    </div>
                </FormRow>
                <FormRow>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_start_time">Hora de inicio</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_start_time" name="start_time" type="time" />
                        </div>
                    </div>
                    <div className="input_group">
                        <label className="label" htmlFor="booking_end_time">Hora de fin</label>
                        <div className="input_container">
                            <input className="form_input" id="booking_end_time" name="end_time" type="time" />
                        </div>
                    </div>
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Crear reserva" icon={CalendarPlus} size="lg" type="button" disabled />
            </FormActions>
        </form>
    </Modal>
);

export default CreateBooking;
