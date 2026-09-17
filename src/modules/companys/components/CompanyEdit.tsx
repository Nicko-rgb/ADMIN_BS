import type { FormEvent } from 'react';
import { Building2, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { FormActions } from '../../../shared/components';
import CompanyStepForm, { type CompanyStepFormProps } from './CompanyStepForm';

interface CompanyEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isSaving?: boolean;
    // Estado y cascada del formulario — sale tal cual de useTenantForm.
    fields: CompanyStepFormProps;
}

/** Modal de edición de la propia empresa — reusa CompanyStepForm, incluido el documento (RUC), por si se cargó mal al registrar. */
export const CompanyEdit = ({ isOpen, onClose, onSubmit, isSaving = false, fields }: CompanyEditProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar empresa" icon={Building2} size="lg">
        <form onSubmit={onSubmit} noValidate>
            <CompanyStepForm {...fields} />

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CompanyEdit;
