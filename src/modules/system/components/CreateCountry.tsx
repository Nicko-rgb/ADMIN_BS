import type { FormEvent } from 'react';
import { Globe, Coins, Clock, Image, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, ToggleField, FormSection, FormRow, FormActions } from '../../../shared/components';
import type { CreateCountryPayload } from '../interfaces/catalog.interface';
import '../styles/CatalogPage.css';

interface CreateCountryProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CreateCountryPayload;
    setField: (name: keyof CreateCountryPayload) => (value: string | boolean) => void;
    isSaving?: boolean;
}

/** Modal de registro de país — campos agrupados por FormSection/FormRow; el hook maneja estado y submit. */
export const CreateCountry = ({ isOpen, onClose, onSubmit, form, setField, isSaving = false }: CreateCountryProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nuevo país" icon={Globe} size="lg">
        <form onSubmit={onSubmit}>
            <FormSection title="Datos del país" icon={Globe}>
                <FormRow>
                    <InputField name="country" label="País" value={form.country} onChange={(e) => setField('country')(e.target.value)} required />
                    <InputField name="iso_country" label="Código ISO" value={form.iso_country} onChange={(e) => setField('iso_country')(e.target.value)} required mayus />
                    <InputField name="phone_code" placeholder='+51' label="Código telefónico" value={form.phone_code} onChange={(e) => setField('phone_code')(e.target.value)} required />
                </FormRow>
            </FormSection>

            <FormSection title="Moneda" icon={Coins}>
                <FormRow>
                    <InputField name="iso_currency" label="Código de moneda" value={form.iso_currency} onChange={(e) => setField('iso_currency')(e.target.value)} required mayus />
                    <InputField name="currency" label="Nombre de la moneda" value={form.currency} onChange={(e) => setField('currency')(e.target.value)} required />
                    <InputField name="currency_simbol" label="Símbolo de moneda" value={form.currency_simbol} onChange={(e) => setField('currency_simbol')(e.target.value)} required />
                </FormRow>
            </FormSection>

            <FormSection title="Configuración regional" icon={Clock}>
                <FormRow>
                    <InputField name="time_zone" label="Zona horaria" value={form.time_zone} onChange={(e) => setField('time_zone')(e.target.value)} required />
                    <InputField name="language" label="Idioma" value={form.language} onChange={(e) => setField('language')(e.target.value)} required />
                    <InputField name="date_format" label="Formato de fecha" value={form.date_format} onChange={(e) => setField('date_format')(e.target.value)} required />
                </FormRow>
            </FormSection>

            <FormSection title="Bandera y estado" icon={Image}>
                <FormRow>
                    <InputField name="flag_url" label="URL de la bandera" value={form.flag_url} onChange={(e) => setField('flag_url')(e.target.value)} required />
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

export default CreateCountry;
