import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, Dumbbell, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, TextAreaField, FormSection, FormRow, FormActions } from '../../../shared/components';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import SpaceService from '../service/spaceService';
import type { SpaceFormMode, SpaceFormValues } from '../interfaces/space.interface';
import { EMPTY_SPACE_FORM } from '../interfaces/space.interface';

interface SpaceFormProps {
    mode: SpaceFormMode;
    sucursalPublicId: string;
    initialValues?: SpaceFormValues;
    onClose: () => void;
    onSaved: () => void;
}

/**
 * Modal de alta/edición de espacio deportivo — estado y service adentro, sin hook
 * separado: `mode` decide título/botón y a dónde pega el submit. En `edit` precarga
 * `initialValues`; el guardado de edición se habilitará cuando el backend lo exponga
 * (hoy el botón queda deshabilitado en ese modo).
 */
export const SpaceForm = ({ mode, sucursalPublicId, initialValues, onClose, onSaved }: SpaceFormProps) => {
    const isEditMode = mode === 'edit';
    const [form, setForm] = useState<SpaceFormValues>(initialValues ?? EMPTY_SPACE_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof SpaceFormValues, string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { surfaceTypes, sportTypes, sportCategories, loadSurfaceTypes, loadSportTypes, loadSportCategories } = useCatalogActive();

    useEffect(() => {
        loadSurfaceTypes();
        loadSportTypes();
        loadSportCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setField = <K extends keyof SpaceFormValues>(name: K, value: SpaceFormValues[K]) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): boolean => {
        const next: typeof errors = {};
        if (!form.name.trim()) next.name = 'El nombre es requerido';
        if (!form.surface_type_id) next.surface_type_id = 'La superficie es requerida';
        if (!form.sport_type_id) next.sport_type_id = 'El tipo de deporte es requerido';
        if (!form.sport_category_id) next.sport_category_id = 'La categoría es requerida';
        if (!form.dimensions.trim()) next.dimensions = 'Las dimensiones son requeridas';
        if (form.minimum_booking_minutes < 1) next.minimum_booking_minutes = 'El mínimo debe ser mayor a 0';
        if (form.maximum_booking_minutes < form.minimum_booking_minutes) next.maximum_booking_minutes = 'El máximo debe ser mayor al mínimo';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            const result = await SpaceService.register(sucursalPublicId, { ...form, name: form.name.trim(), dimensions: form.dimensions.trim() });
            toast.success(result.message);
            onSaved();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose} title={isEditMode ? 'Editar espacio' : 'Nuevo espacio'} icon={Dumbbell} size="md">
            <form onSubmit={handleSubmit} noValidate>
                <FormSection title="Información del espacio" icon={Dumbbell}>
                    <FormRow>
                        <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name', e.target.value)} required error={errors.name} />
                        <SelectField name="surface_type_id" label="Superficie" value={form.surface_type_id || ''} onChange={(e) => setField('surface_type_id', Number(e.target.value))} options={surfaceTypes.map((s) => ({ value: s.id, label: s.name }))} required error={errors.surface_type_id} />
                    </FormRow>
                    <FormRow>
                        <SelectField name="sport_type_id" label="Deporte" value={form.sport_type_id || ''} onChange={(e) => setField('sport_type_id', Number(e.target.value))} options={sportTypes.map((s) => ({ value: s.id, label: s.name }))} required error={errors.sport_type_id} />
                        <SelectField name="sport_category_id" label="Categoría" value={form.sport_category_id || ''} onChange={(e) => setField('sport_category_id', Number(e.target.value))} options={sportCategories.map((s) => ({ value: s.id, label: s.name }))} required error={errors.sport_category_id} />
                    </FormRow>
                    <FormRow>
                        <InputField name="dimensions" label="Dimensiones" value={form.dimensions} onChange={(e) => setField('dimensions', e.target.value)} placeholder="20x40 metros" required error={errors.dimensions} />
                        <InputField name="capacity" label="Capacidad (opcional)" numberOnly="integer" value={form.capacity ?? ''} onChange={(e) => setField('capacity', e.target.value === '' ? null : Number(e.target.value))} error={errors.capacity} />
                    </FormRow>
                    <FormRow>
                        <TextAreaField name="equipment" rows={2} label="Equipamiento (opcional)" value={form.equipment} onChange={(e) => setField('equipment', e.target.value)} placeholder="Arcos, redes, bancas..." />
                    </FormRow>
                </FormSection>

                <FormSection title="Reglas de Reserva" icon={Clock}>
                    <FormRow>
                        <InputField name="minimum_booking_minutes" label="Reserva mínima (min)" numberOnly="integer" value={String(form.minimum_booking_minutes)} onChange={(e) => setField('minimum_booking_minutes', Number(e.target.value))} error={errors.minimum_booking_minutes} />
                        <InputField name="maximum_booking_minutes" label="Reserva máxima (min)" numberOnly="integer" value={String(form.maximum_booking_minutes)} onChange={(e) => setField('maximum_booking_minutes', Number(e.target.value))} error={errors.maximum_booking_minutes} />
                    </FormRow>
                </FormSection>




                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    {isEditMode ? (
                        <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} disabled title="Edición aún no disponible en el backend" />
                    ) : (
                        <Button text="Registrar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
                    )}
                </FormActions>
            </form>
        </Modal>
    );
};

export default SpaceForm;
