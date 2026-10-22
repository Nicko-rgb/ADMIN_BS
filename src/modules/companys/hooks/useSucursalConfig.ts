import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { handleApiError, getApiErrorStatus } from '../../../shared/utils/errorHandler';
import { hasErrors, isValidUrl, type FormErrors } from '../../../shared/utils/formErrors';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import SucursalConfigService from '../service/sucursalConfigService';
import type { SucursalConfigFormValues, SucursalConfigPayload } from '../interfaces/sucursalConfig.interface';

export const EMPTY_SUCURSAL_CONFIG_FORM: SucursalConfigFormValues = {
    social_facebook: '',
    social_instagram: '',
    social_tiktok: '',
    social_youtube: '',
    social_whatsapp: '',
    whatsapp_message: '',
    opening_time: '',
    closing_time: '',
    min_price: '',
    features: '',
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

// 'HH:mm[:ss]' → minutos para comparar apertura vs cierre.
const toMinutes = (value: string): number | null => {
    const match = value.match(TIME_PATTERN);
    if (!match) return null;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
};

const urlError = (value: string, label: string): string | undefined => {
    if (!value.trim()) return undefined;
    if (value.trim().length > 500) return `${label} no puede superar 500 caracteres`;
    return isValidUrl(value.trim()) ? undefined : `${label} debe ser una URL válida (https://...)`;
};

// Reglas espejo de sucursalConfig.schema (backend) — horarios obligatorios y cierre
// posterior a apertura; resto opcional pero validado si trae valor.
const validateConfigForm = (form: SucursalConfigFormValues): FormErrors<SucursalConfigFormValues> => {
    const errors: FormErrors<SucursalConfigFormValues> = {};

    if (!form.opening_time.trim()) errors.opening_time = 'El horario de apertura es requerido';
    else if (!TIME_PATTERN.test(form.opening_time.trim())) errors.opening_time = 'Hora no válida (HH:mm)';

    if (!form.closing_time.trim()) errors.closing_time = 'El horario de cierre es requerido';
    else if (!TIME_PATTERN.test(form.closing_time.trim())) errors.closing_time = 'Hora no válida (HH:mm)';

    if (!errors.opening_time && !errors.closing_time) {
        const opening = toMinutes(form.opening_time.trim())!;
        const closing = toMinutes(form.closing_time.trim())!;
        if (closing <= opening) errors.closing_time = 'El cierre debe ser posterior a la apertura';
    }

    if (form.min_price.trim()) {
        const price = Number(form.min_price);
        if (!Number.isFinite(price) || price < 0) errors.min_price = 'El precio mínimo debe ser un número mayor o igual a 0';
    }

    const social = urlError(form.social_facebook, 'Facebook');
    if (social) errors.social_facebook = social;
    const instagram = urlError(form.social_instagram, 'Instagram');
    if (instagram) errors.social_instagram = instagram;
    const tiktok = urlError(form.social_tiktok, 'TikTok');
    if (tiktok) errors.social_tiktok = tiktok;
    const youtube = urlError(form.social_youtube, 'YouTube');
    if (youtube) errors.social_youtube = youtube;

    if (form.social_whatsapp.trim() && !/^\d{7,15}$/.test(form.social_whatsapp.trim())) {
        errors.social_whatsapp = 'Solo dígitos, entre 7 y 15 (ej: 51987654321)';
    }

    if (form.whatsapp_message.trim().length > 300) errors.whatsapp_message = 'El mensaje no puede superar 300 caracteres';
    if (form.features.trim().length > 2000) errors.features = 'Las características no pueden superar 2000 caracteres';

    return errors;
};

interface UseSucursalConfigArgs {
    sucursalPublicId: string;
    onClose: () => void;
    // Se llama tras guardar con éxito — la página recarga sucursal+config para reflejar cambios.
    onSaved?: () => void;
}

/**
 * Configuración de una sucursal en modal — registro si todavía no tiene (GET 404),
 * edición si ya existe (precarga). El fetch vive acá para no recargar la página.
 * Al guardar hace PUT upsert y cierra; la página no necesita recargarse porque
 * no muestra la config.
 */
export const useSucursalConfig = ({ sucursalPublicId, onClose, onSaved }: UseSucursalConfigArgs) => {
    const [form, setForm] = useState<SucursalConfigFormValues>({ ...EMPTY_SUCURSAL_CONFIG_FORM });
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasConfig, setHasConfig] = useState(false);

    // Los errores por campo recién se pintan cuando se intenta guardar incompleto.
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        let active = true;
        SucursalConfigService.get(sucursalPublicId)
            .then((detail) => {
                if (!active) return;
                setHasConfig(true);
                setForm({
                    social_facebook: detail.socialFacebook ?? '',
                    social_instagram: detail.socialInstagram ?? '',
                    social_tiktok: detail.socialTiktok ?? '',
                    social_youtube: detail.socialYoutube ?? '',
                    social_whatsapp: detail.socialWhatsapp ?? '',
                    whatsapp_message: detail.whatsappMessage ?? '',
                    opening_time: detail.openingTime ?? '',
                    closing_time: detail.closingTime ?? '',
                    min_price: detail.minPrice ?? '',
                    features: detail.features ?? '',
                });
            })
            .catch((err) => {
                if (!active) return;
                // 404 = todavía no tiene config, el modal queda en modo registro con el form vacío.
                if (getApiErrorStatus(err) === 404) return;
                toast.error(handleApiError(err));
                onClose();
            })
            .finally(() => { if (active) setIsLoadingDetail(false); });

        return () => { active = false; };
    }, [sucursalPublicId, onClose]);

    const setField = <K extends keyof SucursalConfigFormValues>(name: K) => (value: SucursalConfigFormValues[K]) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const errors = validateConfigForm(form);
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
            const payload: SucursalConfigPayload = {
                social_facebook: trimmed.social_facebook || null,
                social_instagram: trimmed.social_instagram || null,
                social_tiktok: trimmed.social_tiktok || null,
                social_youtube: trimmed.social_youtube || null,
                social_whatsapp: trimmed.social_whatsapp || null,
                whatsapp_message: trimmed.whatsapp_message || null,
                opening_time: trimmed.opening_time,
                closing_time: trimmed.closing_time,
                min_price: trimmed.min_price ? Number(trimmed.min_price) : null,
                features: trimmed.features || null,
            };

            const result = await SucursalConfigService.save(sucursalPublicId, payload);
            toast.success(result.message);
            onSaved?.();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form, setField, errors: showErrors ? errors : {}, allErrors: errors,
        isLoadingDetail, isSubmitting, isEditMode: hasConfig, handleSubmit,
    };
};

export default useSucursalConfig;
