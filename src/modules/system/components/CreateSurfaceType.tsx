import type { FormEvent } from 'react';
import { Grid3x3, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { CreateSurfaceTypePayload } from '../interfaces/catalog.interface';

interface CreateSurfaceTypeProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CreateSurfaceTypePayload;
    setField: (name: keyof CreateSurfaceTypePayload) => (value: string) => void;
    isSaving?: boolean;
}

/** Modal de registro de tipo de superficie — campos agrupados por FormSection/FormRow; el hook maneja estado y submit. */
export const CreateSurfaceType = ({ isOpen, onClose, onSubmit, form, setField, isSaving = false }: CreateSurfaceTypeProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nueva superficie" icon={Grid3x3}>
        <form onSubmit={onSubmit}>
            <FormSection title="Datos de la superficie" icon={Grid3x3}>
                <FormRow>
                    <InputField name="code" label="Código" value={form.code} onChange={(e) => setField('code')(e.target.value)} required mayus />
                    <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Registrar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CreateSurfaceType;
