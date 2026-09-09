import type { FormEvent } from 'react';
import { UserCog, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, FormSection, FormRow, FormActions, ToggleField } from '../../../shared/components';
import { ROLE_OPTIONS, DOCUMENT_TYPE_OPTIONS } from '../utils/userConstants';
import type { UpdateUserPayload, UserRole, DocumentType } from '../interfaces/user.interface';
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

/** Modal de edición de un usuario — todos los datos personales, nunca password (eso va por un flujo aparte). */
export const UserEdit = ({ isOpen, onClose, onSubmit, form, isLoadingDetail, setField, isSaving = false, countryOptions }: UserEditProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar usuario" icon={UserCog} size="lg">
        {isLoadingDetail || !form ? (
            <div className="user_edit_loading">Cargando datos del usuario...</div>
        ) : (
            <form onSubmit={onSubmit}>
                <FormSection title="Identificación">
                    <FormRow>
                        <InputField name="first_name" label="Nombre" value={form.first_name} onChange={(e) => setField('first_name')(e.target.value)} required />
                        <InputField name="last_name" label="Apellido" value={form.last_name} onChange={(e) => setField('last_name')(e.target.value)} required />
                    </FormRow>
                    <FormRow>
                        <InputField name="email" label="Correo" type="email" value={form.email} onChange={(e) => setField('email')(e.target.value)} />
                        <SelectField name="role" label="Rol" value={form.role} onChange={(e) => setField('role')(e.target.value as UserRole)} options={ROLE_OPTIONS} required />
                    </FormRow>
                </FormSection>

                <FormSection title="Contacto">
                    <FormRow>
                        <InputField name="phone" label="Teléfono" value={form.phone ?? ''} onChange={(e) => setField('phone')(e.target.value)} />
                        <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => setField('country_id')(Number(e.target.value))} options={countryOptions} required />
                    </FormRow>
                </FormSection>

                <FormSection title="Documento">
                    <FormRow>
                        <SelectField name="document_type" label="Tipo de documento" value={form.document_type ?? ''} onChange={(e) => setField('document_type')(e.target.value as DocumentType)} options={DOCUMENT_TYPE_OPTIONS} />
                        <InputField name="document_number" label="Número de documento" value={form.document_number ?? ''} onChange={(e) => setField('document_number')(e.target.value)} />
                    </FormRow>
                    <FormRow>
                        <InputField name="date_birth" label="Fecha de nacimiento" type="date" value={form.date_birth ?? ''} onChange={(e) => setField('date_birth')(e.target.value)} />
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
