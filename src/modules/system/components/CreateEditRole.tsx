import type { FormEvent } from 'react';
import { ShieldUser, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, ToggleField, FormSection, FormRow, FormActions } from '../../../shared/components';

const NO_SCOPE_VALUE = '';
const NO_SCOPE_OPTION = { value: NO_SCOPE_VALUE, label: 'No aplica (ej. cliente)' };
const SCOPE_OPTIONS = [
    { value: '1', label: '1 — Todo (system)' },
    { value: '2', label: '2 — Sus empresas (super_admin)' },
    { value: '3', label: '3 — Sus sucursales (administrador)' },
    { value: '4', label: '4 — Sus sucursales (empleado)' },
];

interface RoleFormFields {
    label: string;
    scope_level: number | null;
    is_active: boolean;
}

interface CreateEditRoleProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    mode: 'create' | 'edit';
    roleKey: string;
    // Solo se usa en modo create — en edit, key queda de solo lectura (es el ancla que usa el
    // resto del sistema para identificar el rol, ver role.dto.ts en el backend).
    onKeyChange: (value: string) => void;
    form: RoleFormFields;
    setField: (name: 'label' | 'scope_level' | 'is_active') => (value: string | number | boolean | null) => void;
    isSaving?: boolean;
}

/** Modal único de alta/edición de un rol — key solo se puede definir al crear, después queda fija. */
export const CreateEditRole = ({ isOpen, onClose, onSubmit, mode, roleKey, onKeyChange, form, setField, isSaving = false }: CreateEditRoleProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Registrar rol' : `Editar rol: ${roleKey}`} icon={ShieldUser} size="md">
        <form onSubmit={onSubmit}>
            <FormSection title="Identificación" icon={ShieldUser}>
                <FormRow>
                    <InputField name="key" label="Key" value={roleKey} onChange={(e) => onKeyChange(e.target.value)} required disabled={mode === 'edit'} placeholder="encargado_turno" />
                    <InputField name="label" label="Etiqueta" value={form.label} onChange={(e) => setField('label')(e.target.value)} required placeholder="Encargado de turno" />
                </FormRow>
            </FormSection>

            <FormSection title="Alcance de datos">
                <FormRow>
                    <SelectField
                        name="scope_level"
                        label="Nivel de alcance"
                        value={form.scope_level != null ? String(form.scope_level) : NO_SCOPE_VALUE}
                        onChange={(e) => setField('scope_level')(e.target.value === NO_SCOPE_VALUE ? null : Number(e.target.value))}
                        options={[NO_SCOPE_OPTION, ...SCOPE_OPTIONS]}
                    />
                    <ToggleField name="is_active" label="Activo" checked={form.is_active} onChange={(e) => setField('is_active')(e.target.checked)} />
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text={mode === 'create' ? 'Registrar' : 'Guardar'} icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CreateEditRole;
