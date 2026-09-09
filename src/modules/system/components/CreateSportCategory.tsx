import type { FormEvent } from 'react';
import { Tags, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { CreateSportCategoryPayload } from '../interfaces/catalog.interface';

interface CreateSportCategoryProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CreateSportCategoryPayload;
    setField: (name: keyof CreateSportCategoryPayload) => (value: string) => void;
    isSaving?: boolean;
}

/** Modal de registro de categoría deportiva — campos agrupados por FormSection/FormRow; el hook maneja estado y submit. */
export const CreateSportCategory = ({ isOpen, onClose, onSubmit, form, setField, isSaving = false }: CreateSportCategoryProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nueva categoría" icon={Tags}>
        <form onSubmit={onSubmit}>
            <FormSection title="Datos de la categoría" icon={Tags}>
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

export default CreateSportCategory;
