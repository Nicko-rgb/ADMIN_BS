import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import SucursalService from '../service/sucursalService';
import { EMPTY_SUCURSAL_FORM, SUCURSAL_REQUIRED_FIELDS, sucursalExtraRules } from '../utils/tenantForm';
import useTenantForm from './useTenantForm';
import type { SucursalPayload } from '../interfaces/sucursal.interface';

// Valor del input al payload — descarta lo que no sea un número real, como un `-` suelto.
const toNumberOrNull = (value: string): number | null => (
    value.trim() && Number.isFinite(Number(value)) ? Number(value) : null
);

interface UseSucursalFormArgs {
    // Empresa bajo la que se registra la sucursal nueva.
    companyTenantId?: string;
    // Sucursal a editar; null en alta.
    sucursalTenantId: string | null;
    onClose: () => void;
    onSaved: () => void;
}

/**
 * Modal de sucursal — alta cuando `sucursalTenantId` es null, edición cuando trae uno: en ese
 * caso busca el detalle al montar y precarga el form. El estado y la cascada de ubigeo viven en
 * useTenantForm; acá queda solo el fetch del detalle y el guardado.
 */
export const useSucursalForm = ({ companyTenantId, sucursalTenantId, onClose, onSaved }: UseSucursalFormArgs) => {
    const { form, setField, preload, errors, isValid, ...ubigeo } = useTenantForm(EMPTY_SUCURSAL_FORM, SUCURSAL_REQUIRED_FIELDS, sucursalExtraRules);

    const isEditMode = sucursalTenantId !== null;
    const [isLoadingDetail, setIsLoadingDetail] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Los errores por campo recién se pintan cuando se intenta guardar con el form incompleto.
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (!sucursalTenantId) return;

        let active = true;
        SucursalService.getByTenantId(sucursalTenantId)
            .then((detail) => {
                if (!active) return;
                preload({
                    name: detail.name,
                    address: detail.address,
                    country_id: detail.country?.id ?? 0,
                    ubigeo_id: detail.ubigeo?.id ?? 0,
                    phone_cell: detail.phoneCell,
                    phone: detail.phone ?? '',
                    latitude: detail.latitude ?? '',
                    longitude: detail.longitude ?? '',
                    description: detail.description ?? '',
                    website: detail.website ?? '',
                }, {
                    departmentId: detail.ubigeo?.departmentId ?? 0,
                    provinceId: detail.ubigeo?.provinceId ?? 0,
                });
            })
            .catch((err) => {
                if (!active) return;
                toast.error(handleApiError(err));
                onClose();
            })
            .finally(() => { if (active) setIsLoadingDetail(false); });

        return () => { active = false; };
    }, [sucursalTenantId, preload, onClose]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!companyTenantId) return;

        if (!isValid) {
            setShowErrors(true);
            toast.error('Completa los campos obligatorios para continuar');
            return;
        }

        setIsSubmitting(true);
        try {
            const trimmed = trimValues(form);
            const payload: SucursalPayload = {
                name: trimmed.name,
                address: trimmed.address,
                country_id: trimmed.country_id,
                ubigeo_id: trimmed.ubigeo_id,
                phone_cell: trimmed.phone_cell,
                phone: trimmed.phone || null,
                latitude: toNumberOrNull(trimmed.latitude),
                longitude: toNumberOrNull(trimmed.longitude),
                description: trimmed.description || null,
                website: trimmed.website || null,
            };

            const result = sucursalTenantId
                ? await SucursalService.update(sucursalTenantId, payload)
                : await SucursalService.register(companyTenantId, payload);

            toast.success(result.message);
            onSaved();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        ...ubigeo,
        isEditMode, isLoadingDetail, isSubmitting,
        form, setField, errors: showErrors ? errors : {},
        handleSubmit,
    };
};

export default useSucursalForm;
