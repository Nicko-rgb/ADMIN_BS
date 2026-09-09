import type { FormEvent } from 'react';
import { MapPin, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, FormRow, FormActions } from '../../../shared/components';
import '../styles/UbigeoPage.css';

interface CreateEditUbigeoForm {
    name: string;
    code: string;
}

interface CreateEditUbigeoProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    mode: 'create' | 'edit';
    title: string;
    contextLabel?: string | null;
    form: CreateEditUbigeoForm;
    setField: (name: keyof CreateEditUbigeoForm) => (value: string) => void;
    isSaving?: boolean;
}

/** Modal único de creación/edición de un nodo de ubigeo — mismo formulario (nombre/código) para cualquier nivel, sin depender de EditCatalogo. */
export const CreateEditUbigeo = ({ isOpen, onClose, onSubmit, mode, title, contextLabel, form, setField, isSaving = false }: CreateEditUbigeoProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={MapPin}>
        <form onSubmit={onSubmit}>
            {contextLabel && <p className="ubigeo_form_context">{contextLabel}</p>}
            <FormRow>
                <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                <InputField name="code" label="Código" value={form.code} onChange={(e) => setField('code')(e.target.value)} required numberOnly />
            </FormRow>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text={mode === 'create' ? 'Registrar' : 'Guardar'} icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CreateEditUbigeo;
