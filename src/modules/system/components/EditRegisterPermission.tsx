import type { FormEvent } from 'react';
import { ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, TextAreaField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { CreatePermissionPayload, PermissionAppAccess } from '../interfaces/permission.interface';

const APP_ACCESS_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'booking', label: 'Booking' },
    { value: 'both', label: 'Ambas' },
];

interface EditRegisterPermissionProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    mode: 'create' | 'edit';
    form: CreatePermissionPayload;
    setField: (name: keyof CreatePermissionPayload) => (value: string | null) => void;
    isSaving?: boolean;
}

/** Modal único de creación/edición de un permiso — key queda de solo lectura al editar, para no huerfanar a las filas que la referencian por string (menu_item.required_permission, user_permission.permission_key). */
export const EditRegisterPermission = ({ isOpen, onClose, onSubmit, mode, form, setField, isSaving = false }: EditRegisterPermissionProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Registrar permiso' : 'Editar permiso'} icon={ShieldCheck} size="md">
        <form onSubmit={onSubmit}>
            <FormSection title="Identificación" icon={ShieldCheck}>
                <FormRow>
                    <InputField name="key" label="Key" value={form.key} onChange={(e) => setField('key')(e.target.value)} required disabled={mode === 'edit'} placeholder="modulo.accion" />
                    <InputField name="label" label="Etiqueta" value={form.label} onChange={(e) => setField('label')(e.target.value)} required placeholder="Confirmar reserva" />
                </FormRow>
            </FormSection>

            <FormSection title="Clasificación">
                <FormRow>
                    <InputField name="module" label="Módulo" value={form.module} onChange={(e) => setField('module')(e.target.value)} required placeholder="booking" />
                    <SelectField name="app_access" label="Acceso por app" value={form.app_access} onChange={(e) => setField('app_access')(e.target.value as PermissionAppAccess)} options={APP_ACCESS_OPTIONS} required />
                </FormRow>
                <FormRow>
                    <TextAreaField name="description" label="Descripción" value={form.description ?? ''} onChange={(e) => setField('description')(e.target.value)} placeholder="Qué permite hacer este permiso" />
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text={mode === 'create' ? 'Registrar' : 'Guardar'} icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default EditRegisterPermission;
