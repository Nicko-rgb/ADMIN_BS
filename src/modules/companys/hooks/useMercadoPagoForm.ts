import { useState } from 'react';
import type { FormEvent } from 'react';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { hasErrors, requiredErrors, type FormErrors } from '../../../shared/utils/formErrors';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import PaymentConfigService from '../service/paymentConfigService';
import type {
    MercadoPagoEnvironment,
    MercadoPagoFormValues,
    RegisterMercadoPagoPayload,
} from '../interfaces/paymentConfig.interface';

export const EMPTY_MERCADO_PAGO_FORM: MercadoPagoFormValues = {
    access_token: '',
    public_key: '',
    environment: 'SANDBOX',
};

export const MERCADO_PAGO_ENVIRONMENT_OPTIONS = [
    { value: 'SANDBOX', label: 'Pruebas (Sandbox)' },
    { value: 'PRODUCTION', label: 'Producción' },
];

// Mismo mínimo que valida el schema del backend — evita un 400 por un valor claramente incompleto.
const MIN_ACCESS_TOKEN_LENGTH = 10;

const validate = (form: MercadoPagoFormValues): FormErrors<MercadoPagoFormValues> => {
    const errors = requiredErrors(form, ['access_token', 'public_key']);
    if (!errors.access_token && form.access_token.trim().length < MIN_ACCESS_TOKEN_LENGTH) {
        errors.access_token = 'El access token no parece válido';
    }
    return errors;
};

interface UseMercadoPagoFormArgs {
    sucursalPublicId: string;
    // Estado real de la sucursal, consultado por la página.
    isConnected: boolean;
    // Recarga el estado en la página (tras registrar o desconectar).
    onChanged: () => void;
}

/**
 * Registro y desconexión de Mercado Pago de una sucursal.
 *
 * No hay edición: si ya hay una cuenta se desconecta y se vuelve a registrar.
 * Al desconectar no se cierra el modal: se elimina la credencial y aparece el
 * formulario de tokens.
 */
export const useMercadoPagoForm = ({ sucursalPublicId, isConnected, onChanged }: UseMercadoPagoFormArgs) => {
    const [form, setForm] = useState<MercadoPagoFormValues>({ ...EMPTY_MERCADO_PAGO_FORM });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Los errores por campo recién se pintan cuando se intenta guardar incompleto.
    const [showErrors, setShowErrors] = useState(false);

    // Tras desconectar se muestra el formulario aunque la recarga de la página
    // todavía esté en curso.
    const [hasDisconnected, setHasDisconnected] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const setField = <K extends keyof MercadoPagoFormValues>(name: K) => (value: MercadoPagoFormValues[K]) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const setEnvironment = (value: string) => setField('environment')(value as MercadoPagoEnvironment);

    const errors = validate(form);
    const isValid = !hasErrors(errors);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) {
            setShowErrors(true);
            toast.error('Completa los campos obligatorios para continuar');
            return;
        }

        setIsSubmitting(true);
        try {
            const trimmed = trimValues(form);
            const payload: RegisterMercadoPagoPayload = {
                access_token: trimmed.access_token,
                public_key: trimmed.public_key,
                environment: trimmed.environment,
            };

            const message = await PaymentConfigService.registerMercadoPago(sucursalPublicId, payload);
            toast.success(message);
            setForm({ ...EMPTY_MERCADO_PAGO_FORM, environment: trimmed.environment });
            setShowErrors(false);
            setHasDisconnected(false);
            onChanged();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const disconnect = async () => {
        setIsDisconnecting(true);
        try {
            const message = await PaymentConfigService.disconnectMercadoPago(sucursalPublicId);
            toast.success(message);
            setHasDisconnected(true);
            setForm({ ...EMPTY_MERCADO_PAGO_FORM });
            setShowErrors(false);
            onChanged();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDisconnecting(false);
        }
    };

    return {
        form,
        setField,
        setEnvironment,
        errors: showErrors ? errors : {},
        isSubmitting,
        handleSubmit,
        isConnected: isConnected && !hasDisconnected,
        isDisconnecting,
        disconnect,
    };
};

export default useMercadoPagoForm;
