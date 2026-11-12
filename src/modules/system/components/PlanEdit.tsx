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
    onFieldChange: (name: keyof UpdatePlanPayload) => (value: string | number | boolean | null) => void;
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

    // Un límite vacío representa NULL: ilimitado. Cualquier número es un tope real.
    const handleLimitChange = (name: 'max_subsidiaries' | 'max_spaces' | 'max_users' | 'max_invoices_monthly') =>
        (e: ChangeEvent<HTMLInputElement>) => {
            onFieldChange(name)(e.target.value.trim() === '' ? null : e.target.value);
        };

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

                <p className="plan_limits_hint">Dejá un límite vacío para guardarlo como ilimitado (∞).</p>

                <FormRow>
                    <InputField name="max_subsidiaries" label="Máx. sucursales" value={form.max_subsidiaries ?? ''} onChange={handleLimitChange('max_subsidiaries')} placeholder="Ilimitado" numberOnly="integer" />
                    <InputField name="max_spaces" label="Máx. espacios" value={form.max_spaces ?? ''} onChange={handleLimitChange('max_spaces')} placeholder="Ilimitado" numberOnly="integer" />
                    <InputField name="max_users" label="Máx. usuarios" value={form.max_users ?? ''} onChange={handleLimitChange('max_users')} placeholder="Ilimitado" numberOnly="integer" />
                </FormRow>

                <FormRow>
                    <InputField name="max_invoices_monthly" label="Máx. facturas/mes" value={form.max_invoices_monthly ?? ''} onChange={handleLimitChange('max_invoices_monthly')} placeholder="Ilimitado" numberOnly="integer" />
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
