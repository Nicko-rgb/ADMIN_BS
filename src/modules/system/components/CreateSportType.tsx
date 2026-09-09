import type { FormEvent } from 'react';
import { Trophy, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, ToggleField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { CreateSportTypePayload } from '../interfaces/catalog.interface';

interface CreateSportTypeProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CreateSportTypePayload;
    setField: (name: keyof CreateSportTypePayload) => (value: string | boolean) => void;
    isSaving?: boolean;
}

/** Modal de registro de tipo de deporte — campos agrupados por FormSection/FormRow; el hook maneja estado y submit. */
export const CreateSportType = ({ isOpen, onClose, onSubmit, form, setField, isSaving = false }: CreateSportTypeProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nuevo deporte" icon={Trophy}>
        <form onSubmit={onSubmit}>
            <FormSection title="Datos del deporte" icon={Trophy}>
                <FormRow>
                    <InputField name="code" label="Código" value={form.code} onChange={(e) => setField('code')(e.target.value)} required mayus />
                    <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                </FormRow>
                <FormRow>
                    <ToggleField name="is_active" label="Activo" checked={form.is_active} onChange={(e) => setField('is_active')(e.target.checked)} />
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Registrar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CreateSportType;
