import type { ChangeEvent, FormEvent } from 'react';
import { Gift, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, ToggleField, FormRow, FormActions } from '../../../shared/components';
import type { UpdatePlanPayload } from '../interfaces/catalog.interface';
import '../styles/PlanEdit.css';

const NOTIFICATIONS_TIER_OPTIONS = [
    { value: 'basic', label: 'Básico' },
    { value: 'full', label: 'Full' },
];

interface PlanEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: Required<UpdatePlanPayload> | null;
    onFieldChange: (name: keyof UpdatePlanPayload) => (value: string | number | boolean) => void;
    newFeature: string;
    onNewFeatureChange: (value: string) => void;
    onAddFeature: () => void;
    onRemoveFeature: (index: number) => void;
    isSaving?: boolean;
}

/** Modal de edición dedicado a planes SaaS — campos propios (no reutiliza EditCatalogo) más el editor de características, todo en este mismo archivo. */
export const PlanEdit = ({
    isOpen, onClose, onSubmit, form, onFieldChange,
    newFeature, onNewFeatureChange, onAddFeature, onRemoveFeature,
    isSaving = false,
}: PlanEditProps) => {
    if (!form) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar plan" icon={Gift}>
            <form className="plan_edit_form" onSubmit={onSubmit}>
                <FormRow>
                    <InputField name="name" label="Nombre" value={form.name} onChange={(e) => onFieldChange('name')(e.target.value)} required />
                    <InputField name="code" label="Código" value={form.code} onChange={(e) => onFieldChange('code')(e.target.value)} required />
                </FormRow>

                <FormRow>
                    <InputField name="price_monthly" label="Precio mensual" value={form.price_monthly} onChange={(e) => onFieldChange('price_monthly')(e.target.value)} required numberOnly />
                    <InputField name="price_yearly" label="Precio anual" value={form.price_yearly} onChange={(e) => onFieldChange('price_yearly')(e.target.value)} required numberOnly />
                </FormRow>

                <FormRow>
                    <InputField name="max_subsidiaries" label="Máx. sucursales" value={form.max_subsidiaries} onChange={(e) => onFieldChange('max_subsidiaries')(e.target.value)} required numberOnly />
                    <InputField name="max_spaces" label="Máx. espacios" value={form.max_spaces} onChange={(e) => onFieldChange('max_spaces')(e.target.value)} required numberOnly />
                    <InputField name="max_users" label="Máx. usuarios" value={form.max_users} onChange={(e) => onFieldChange('max_users')(e.target.value)} required numberOnly />
                </FormRow>

                <FormRow>
                    <InputField name="max_invoices_monthly" label="Máx. facturas/mes" value={form.max_invoices_monthly} onChange={(e) => onFieldChange('max_invoices_monthly')(e.target.value)} required numberOnly />
                    <SelectField name="notifications_tier" label="Notificaciones" value={form.notifications_tier} onChange={(e) => onFieldChange('notifications_tier')(e.target.value)} options={NOTIFICATIONS_TIER_OPTIONS} required />
                </FormRow>

                <FormRow>
                    <ToggleField name="has_advanced_reports" label="Reportes avanzados" checked={form.has_advanced_reports} onChange={(e) => onFieldChange('has_advanced_reports')(e.target.checked)} />
                    <ToggleField name="allows_multi_company" label="Multi empresa" checked={form.allows_multi_company} onChange={(e) => onFieldChange('allows_multi_company')(e.target.checked)} />
                    <ToggleField name="is_active" label="Activo" checked={form.is_active} onChange={(e) => onFieldChange('is_active')(e.target.checked)} />
                </FormRow>

                <div className="plan_features_editor">
                    <span className="plan_features_label">Características</span>

                    <div className="plan_features_add">
                        <InputField
                            name="newFeature"
                            value={newFeature}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onNewFeatureChange(e.target.value)}
                            placeholder="Ej: Soporte 24/7"
                        />
                        <Button size='md' text="Agregar" type="button" icon={Plus} onClick={onAddFeature} />
                    </div>

                    <ul className="plan_features_list">
                        {form.features.length === 0 && <li className="plan_features_empty">Sin características agregadas</li>}
                        {form.features.map((feature, index) => (
                            <li key={`${feature}-${index}`} className="plan_features_item">
                                <span>{feature}</span>
                                <button type="button" className="plan_features_remove" onClick={() => onRemoveFeature(index)} aria-label="Quitar característica">
                                    <Trash2 size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
                </FormActions>
            </form>
        </Modal>
    );
};

export default PlanEdit;
