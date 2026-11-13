import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import useCatalogActive from '../../../shared/hooks/useCatalogActive';
import { usePermission } from '../../../shared/hooks/usePermission';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import BookingService from '../service/bookingService';
import { depositBalance, emptyBookingForm, toCreateBookingPayload, validateBookingForm } from '../utils/createBookingForm';
import type { BookingData, CreateBookingForm } from '../interfaces/createBooking.interface';

interface UseCreateBookingArgs {
    spacePublicId: string;
    initialDate?: string;
    initialStartTime?: string;
    initialEndTime?: string;
    onClose: () => void;
    onCreated?: (booking: BookingData) => void;
}

export const useCreateBooking = ({
    spacePublicId,
    initialDate = '',
    initialStartTime = '',
    initialEndTime = '',
    onClose,
    onCreated,
}: UseCreateBookingArgs) => {
    const [form, setForm] = useState(() => emptyBookingForm(initialDate, initialStartTime, initialEndTime));
    const [showErrors, setShowErrors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submitting = useRef(false);
    const mounted = useRef(false);
    const { paymentTypes, isLoadingPaymentTypes, loadPaymentTypes } = useCatalogActive();
    const can = usePermission();
    const canCreate = ['booking.create', 'booking.confirm', 'payment.create', 'user.client_manage'].every((permission) => can(permission));
    const canConfirmPayment = can('payment.confirmed');

    useEffect(() => {
        mounted.current = true;
        void loadPaymentTypes();
        return () => { mounted.current = false; };
    }, [loadPaymentTypes]);

    const paymentOptions = paymentTypes.map((payment) => ({
        value: payment.id,
        label: payment.countryName ? `${payment.name} · ${payment.countryName}` : payment.name,
    }));
    const errors = validateBookingForm(form);
    const balance = depositBalance(form);

    const setField = <K extends keyof CreateBookingForm>(name: K) => (value: CreateBookingForm[K]) => {
        if (submitting.current) return;
        setForm((previous) => ({ ...previous, [name]: value }));
        setSubmitError(null);
    };

    const close = () => {
        if (!submitting.current) onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current) return;
        setShowErrors(true);
        setSubmitError(null);
        if (Object.keys(errors).length > 0) return;
        // Cobrar dinero al reservar (adelanto o total) exige confirmar pagos.
        if (!canCreate || (form.payment_status !== 'PENDING' && !canConfirmPayment)) {
            setSubmitError('No tienes los permisos necesarios para registrar esta reserva.');
            return;
        }
        if (!spacePublicId || isLoadingPaymentTypes || !paymentTypes.some((payment) => payment.id === Number(form.payment_type_id))) {
            setSubmitError('Selecciona un espacio y un tipo de pago disponible.');
            return;
        }

        submitting.current = true;
        setIsSubmitting(true);
        let result;
        try {
            result = await BookingService.register(spacePublicId, toCreateBookingPayload(form));
        } catch (error) {
            if (mounted.current) setSubmitError(handleApiError(error));
            return;
        } finally {
            submitting.current = false;
            if (mounted.current) setIsSubmitting(false);
        }

        toast.success(result.message);
        if (mounted.current) {
            onClose();
            onCreated?.(result.data);
        }
    };

    return {
        form, setField, errors: showErrors ? errors : {}, handleSubmit, close,
        isSubmitting, submitError, canCreate, canConfirmPayment, balance,
        paymentOptions, isLoadingPaymentTypes, retryPaymentTypes: loadPaymentTypes,
    };
};

export default useCreateBooking;
