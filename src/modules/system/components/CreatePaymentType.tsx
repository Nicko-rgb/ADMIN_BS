import type { FormEvent } from 'react';
import { CreditCard, Landmark, Percent, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, TextAreaField, ToggleField, FormSection, FormRow, FormActions } from '../../../shared/components';
import { CATEGORY_OPTIONS } from '../hooks/usePaymentTypes';
import type { RawOption } from '../../../shared/interfaces/forms.interface';
import type { CreatePaymentTypePayload } from '../interfaces/catalog.interface';

interface CreatePaymentTypeProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CreatePaymentTypePayload;
    setField: (name: keyof CreatePaymentTypePayload) => (value: string | number | boolean | null) => void;
    countryOptions: RawOption[];
    isSaving?: boolean;
}

/** Modal de registro de tipo de pago — campos agrupados por FormSection/FormRow; el hook maneja estado y submit. */
export const CreatePaymentType = ({ isOpen, onClose, onSubmit, form, setField, countryOptions, isSaving = false }: CreatePaymentTypeProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nuevo tipo de pago" icon={CreditCard} size="lg">
        <form onSubmit={onSubmit}>
            <FormSection title="Datos generales" icon={CreditCard}>
                <FormRow>
                    <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                    <InputField name="code" label="Código" placeholder='CARD, YAPE' value={form.code} onChange={(e) => setField('code')(e.target.value)} required mayus />
                    <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => setField('country_id')(Number(e.target.value))} options={countryOptions} required />
                </FormRow>
            </FormSection>

            <FormSection title="Proveedor" icon={Landmark}>
                <FormRow>
                    <InputField name="provider" label="Proveedor" value={form.provider ?? ''} onChange={(e) => setField('provider')(e.target.value)} />
                    <SelectField name="category" label="Categoría" value={form.category} onChange={(e) => setField('category')(e.target.value)} options={CATEGORY_OPTIONS} required />
                    <InputField name="processing_time" label="Tiempo de procesamiento" placeholder="Inmediato, 1-3 días..." value={form.processing_time ?? ''} onChange={(e) => setField('processing_time')(e.target.value)} />
                </FormRow>
                <InputField name="icon_url" label="URL del ícono" placeholder="https://icon.img" value={form.icon_url ?? ''} onChange={(e) => setField('icon_url')(e.target.value)} />
            </FormSection>

            <FormSection title="Comisiones y límites" icon={Percent}>
                <FormRow>
                    <InputField name="commission_percentage" label="Comisión %" placeholder="0.0350 = 3.5%" value={form.commission_percentage ?? ''} onChange={(e) => setField('commission_percentage')(e.target.value)} numberOnly />
                    <InputField name="fixed_commission" label="Comisión fija" value={form.fixed_commission ?? ''} onChange={(e) => setField('fixed_commission')(e.target.value)} numberOnly />
                    <InputField name="min_amount" label="Monto mínimo" value={form.min_amount ?? ''} onChange={(e) => setField('min_amount')(e.target.value)} numberOnly />
                    <InputField name="max_amount" label="Monto máximo" value={form.max_amount ?? ''} onChange={(e) => setField('max_amount')(e.target.value)} numberOnly />
                </FormRow>
            </FormSection>

            <FormSection title="Descripción y estado" icon={CreditCard}>
                <FormRow>
                    <TextAreaField name="description" label="Descripción" value={form.description ?? ''} onChange={(e) => setField('description')(e.target.value)} />
                </FormRow>
                <FormRow>
                    <ToggleField name="is_enabled" label="Habilitado" checked={form.is_enabled} onChange={(e) => setField('is_enabled')(e.target.checked)} />
                </FormRow>
            </FormSection>

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Registrar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CreatePaymentType;
