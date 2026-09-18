import type { FormEvent } from 'react';
import { LayoutGrid, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, ToggleField, CheckboxField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { RawOption } from '../../../shared/interfaces/forms.interface';
import type { RoleAdmin } from '../../../shared/interfaces/catalog.interface';
import type { CreateMenuItemPayload, MenuAppAccess } from '../interfaces/menu.interface';

const APP_ACCESS_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'booking', label: 'Booking' },
    { value: 'both', label: 'Ambas' },
];

const NO_PARENT_VALUE = '';

interface CreateEditMenuItemProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    mode: 'create' | 'edit';
    form: CreateMenuItemPayload;
    setField: (name: keyof CreateMenuItemPayload) => (value: string | number | boolean | null) => void;
    toggleRole: (roleId: number) => void;
    parentOptions: RawOption[];
    roles: RoleAdmin[];
    isSaving?: boolean;
}

/** Modal único de creación/edición de un ítem de menú — key queda de solo lectura al editar, para no huerfanar a los hijos que la referencian por parent_key. */
export const CreateEditMenuItem = ({ isOpen, onClose, onSubmit, mode, form, setField, toggleRole, parentOptions, roles, isSaving = false }: CreateEditMenuItemProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Registrar ítem de menú' : 'Editar ítem de menú'} icon={LayoutGrid} size="lg">
        <form onSubmit={onSubmit}>
            <FormSection title="Identificación" icon={LayoutGrid}>
                <FormRow>
                    <InputField name="key" label="Key" value={form.key} onChange={(e) => setField('key')(e.target.value)} required disabled={mode === 'edit'} placeholder="dashboard" />
                    <InputField name="label" label="Etiqueta" value={form.label} onChange={(e) => setField('label')(e.target.value)} required placeholder="Panel principal" />
                </FormRow>
            </FormSection>

            <FormSection title="Navegación">
                <FormRow>
                    <InputField name="icon" label="Ícono" value={form.icon ?? ''} onChange={(e) => setField('icon')(e.target.value)} placeholder="LayoutDashboard" />
                    <InputField name="path" label="Ruta" value={form.path ?? ''} onChange={(e) => setField('path')(e.target.value)} placeholder="/dashboard" />
                    <SelectField
                        name="parent_key"
                        label="Ítem padre"
                        value={form.parent_key ?? NO_PARENT_VALUE}
                        onChange={(e) => setField('parent_key')(e.target.value === NO_PARENT_VALUE ? null : String(e.target.value))}
                        options={[{ value: NO_PARENT_VALUE, label: 'Ninguno (nivel raíz)' }, ...parentOptions]}
                    />
                </FormRow>
            </FormSection>

            <FormSection title="Acceso">
                <FormRow>
                    <SelectField name="app_access" label="Acceso por app" value={form.app_access} onChange={(e) => setField('app_access')(e.target.value as MenuAppAccess)} options={APP_ACCESS_OPTIONS} required />
                    <InputField name="group_title" label="Grupo" value={form.group_title ?? ''} onChange={(e) => setField('group_title')(e.target.value)} placeholder="GENERAL" />
                </FormRow>
                <FormRow>
                    {roles.map((role) => (
                        <CheckboxField
                            key={role.id}
                            name={`role_${role.id}`}
                            label={role.label}
                            checked={form.role_ids.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                        />
                    ))}
                </FormRow>
            </FormSection>

            <FormSection title="Orden y estado">
                <FormRow>
                    <InputField name="sort_order" label="Orden" value={form.sort_order} onChange={(e) => setField('sort_order')(e.target.value)} required numberOnly />
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

export default CreateEditMenuItem;
