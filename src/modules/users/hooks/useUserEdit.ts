import { useState } from 'react';
import type { FormEvent } from 'react';
import UserService from '../service/userService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import type { UpdateUserPayload, UserDetail } from '../interfaces/user.interface';

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (detail: UserDetail): Required<UpdateUserPayload> => ({
    first_name: detail.firstName ?? '',
    last_name: detail.lastName ?? '',
    email: detail.email ?? '',
    role: detail.role,
    is_enabled: detail.isEnabled,
    phone: detail.phone,
    country_id: detail.countryId ?? 0,
    document_type: detail.documentType,
    document_number: detail.documentNumber,
    date_birth: detail.dateBirth,
});

/**
 * Edición de un usuario por id (`PUT /api/users/:id`, siempre `system`, `user.manage_all`) —
 * compartido entre el listado de usuarios (useUsers) y la edición del dueño desde el detalle de
 * empresa (useCompany), que solo difieren en desde dónde se dispara y qué hacen al terminar
 * (`onSuccess`, ej. recargar el listado o refrescar el detalle de la empresa).
 */
export const useUserEdit = () => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateUserPayload> | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Trae el detalle completo por id — el listado/detalle que dispara la edición no trae todos los campos editables.
    const openEdit = async (id: number) => {
        setEditingId(id);
        setIsLoadingDetail(true);
        try {
            const detail = await UserService.getById(id);
            setForm(toEditForm(detail));
        } catch (err) {
            toast.error(handleApiError(err));
            setEditingId(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateUserPayload) => (value: string | number | boolean | null) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const submit = async (e: FormEvent<HTMLFormElement>, onSuccess?: () => void) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await UserService.update(editingId, trimValues(form));
            toast.success(result.message);
            closeEdit();
            onSuccess?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return { isEditOpen: editingId !== null, form, isLoadingDetail, isSaving, openEdit, closeEdit, setField, submit };
};

export default useUserEdit;
