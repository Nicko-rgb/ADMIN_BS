import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import useCatalogActive from '../../../shared/hooks/useCatalogActive';
import { usePermission } from '../../../shared/hooks/usePermission';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import BookingService from '../service/bookingService';
import { useBookingStore } from '../store/bookingStore';
import { emptyPaymentForm, toCents, toPaymentPayload, validatePaymentForm } from '../utils/bookingPaymentForm';
import type { BookingData, RegisterBookingPaymentForm } from '../interfaces/createBooking.interface';

const PAYABLE_STATUSES: BookingData['status'][] = ['PENDING', 'CONFIRMED'];

/**
 * Detalle de una reserva y cobro de su saldo (total o parcial). La reserva
 * vigente se lee del store para reflejar el cobro apenas responde el backend.
 */
export const useBookingPayment = (initialBooking: BookingData, onClose: () => void) => {
    const storeBooking = useBookingStore((state) => state.bookings.find((item) => item.bookingId === initialBooking.bookingId));
    const upsertBooking = useBookingStore((state) => state.upsertBooking);
    const [updatedBooking, setUpdatedBooking] = useState<BookingData | null>(null);
    const booking = updatedBooking ?? storeBooking ?? initialBooking;
    const { pendingAmount } = booking.paymentSummary;

    const [form, setForm] = useState<RegisterBookingPaymentForm>(() => emptyPaymentForm(pendingAmount));
    const [showErrors, setShowErrors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submitting = useRef(false);
    const mounted = useRef(false);
    const { paymentTypes, isLoadingPaymentTypes, loadPaymentTypes } = useCatalogActive();
    const can = usePermission();

    const hasPending = toCents(pendingAmount) > 0;
    const canCollect = can('payment.confirmed') && hasPending && PAYABLE_STATUSES.includes(booking.status);

    useEffect(() => {
        mounted.current = true;
        if (canCollect) void loadPaymentTypes();
        return () => { mounted.current = false; };
    }, [canCollect, loadPaymentTypes]);

    const paymentOptions = paymentTypes.map((payment) => ({
        value: payment.id,
        label: payment.countryName ? `${payment.name} · ${payment.countryName}` : payment.name,
    }));
    const errors = validatePaymentForm(form, pendingAmount);

    const setField = <K extends keyof RegisterBookingPaymentForm>(name: K) => (value: RegisterBookingPaymentForm[K]) => {
        if (submitting.current) return;
        setForm((previous) => ({ ...previous, [name]: value }));
        setSubmitError(null);
    };

    const close = () => {
        if (!submitting.current) onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current || !canCollect) return;
        setShowErrors(true);
        setSubmitError(null);
        if (Object.keys(errors).length > 0) return;

        submitting.current = true;
        setIsSubmitting(true);
        try {
            const result = await BookingService.registerPayment(booking.bookingId, toPaymentPayload(form));
            toast.success(result.message);
            upsertBooking(result.data);
            if (mounted.current) {
                setUpdatedBooking(result.data);
                setForm(emptyPaymentForm(result.data.paymentSummary.pendingAmount));
                setShowErrors(false);
            }
        } catch (error) {
            if (mounted.current) setSubmitError(handleApiError(error));
        } finally {
            submitting.current = false;
            if (mounted.current) setIsSubmitting(false);
        }
    };

    return {
        booking, form, setField, errors: showErrors ? errors : {}, handleSubmit, close,
        isSubmitting, submitError, canCollect, hasPending,
        paymentOptions, isLoadingPaymentTypes, retryPaymentTypes: loadPaymentTypes,
    };
};

export default useBookingPayment;
