import type { FormEvent } from 'react';
import { UserCog, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { SelectField, FormSection, FormRow, FormActions, ToggleField } from '../../../shared/components';
import UserProfileFields from './UserProfileFields';
import { ROLE_OPTIONS } from '../utils/userConstants';
import type { UpdateUserPayload, UserRole } from '../interfaces/user.interface';
import '../styles/UserEdit.css';

interface UserEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: Required<UpdateUserPayload> | null;
    isLoadingDetail: boolean;
    setField: (name: keyof UpdateUserPayload) => (value: string | number | boolean | null) => void;
    isSaving?: boolean;
    countryOptions: { value: number; label: string }[];
}

/** Modal de edición de un usuario (system, cualquier usuario) — reusa UserProfileFields y agrega su propia sección de Acceso (rol/habilitado, administrativos); nunca password (eso va por un flujo aparte). */
export const UserEdit = ({ isOpen, onClose, onSubmit, form, isLoadingDetail, setField, isSaving = false, countryOptions }: UserEditProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar usuario" icon={UserCog} size="lg">
        {isLoadingDetail || !form ? (
            <div className="user_edit_loading">Cargando datos del usuario...</div>
        ) : (
            <form onSubmit={onSubmit}>
                <UserProfileFields form={form} setField={setField} countryOptions={countryOptions} />

                <FormSection title="Acceso">
                    <FormRow>
                        <SelectField name="role" label="Rol" value={form.role} onChange={(e) => setField('role')(e.target.value as UserRole)} options={ROLE_OPTIONS} required />
                        <ToggleField name="is_enabled" label="Habilitado" checked={form.is_enabled} onChange={(e) => setField('is_enabled')(e.target.checked)} />
                    </FormRow>
                </FormSection>

                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
                </FormActions>
            </form>
        )}
    </Modal>
);

export default UserEdit;
