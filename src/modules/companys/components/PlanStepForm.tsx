import { Check, CreditCard } from 'lucide-react';
import { FormSection } from '../../../shared/components';
import type { Plan } from '../../../shared/interfaces/catalog.interface';
import type { PlanStepForm as PlanStepFormData } from '../interfaces/companyRegistration.interface';

const FEATURES_PREVIEW_LIMIT = 5; // cuántas características se muestran antes del "+N más"
const UNLIMITED_LIMIT = 999; // convención del backend para "ilimitado" en max_subsidiaries/max_spaces/max_users (ver comentario del modelo SaaSPlan)

// Formatea un límite numérico del plan — "∞" cuando alcanza el tope de "ilimitado".
const formatPlanLimit = (value: number) => (value >= UNLIMITED_LIMIT ? '∞' : value);

const NOTIFICATIONS_TIER_LABELS: Record<string, string> = {
    basic: 'Notif. básicas',
    full: 'Notif. full',
};

interface PlanStepFormProps {
    plans: Plan[];
    form: PlanStepFormData;
    setField: (name: keyof PlanStepFormData) => (value: string | number) => void;
}

/** Paso "plan" del alta — periodicidad de facturación y grilla de planes disponibles. Solo lo usa el wizard, la edición de empresa/dueño no toca el plan. */
export const PlanStepForm = ({ plans, form, setField }: PlanStepFormProps) => (
    <FormSection title="Plan de suscripción" icon={CreditCard}>
        <div className="register_billing_toggle">
            <button type="button" className={form.billing_period === 'monthly' ? 'is_active' : ''} onClick={() => setField('billing_period')('monthly')}>Mensual</button>
            <button type="button" className={form.billing_period === 'yearly' ? 'is_active' : ''} onClick={() => setField('billing_period')('yearly')}>Anual</button>
        </div>

        <div className="register_plans_grid">
            {plans.map((plan) => (
                <button
                    key={plan.id}
                    type="button"
                    className={`register_plan_card ${form.plan_id === plan.id ? 'is_selected' : ''}`}
                    onClick={() => setField('plan_id')(plan.id)}
                >
                    <span className="register_plan_radio">{form.plan_id === plan.id && <Check size={14} />}</span>

                    <div className="register_plan_card_header">
                        <span className="register_plan_card_name">{plan.name}</span>
                    </div>

                    <div className="register_plan_price">
                        <strong>${Number(form.billing_period === 'monthly' ? plan.priceMonthly : plan.priceYearly).toFixed(2)}</strong>
                        <span> / {form.billing_period === 'monthly' ? 'mes' : 'año'}</span>
                    </div>

                    <div className="register_plan_card_limits">
                        <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxSubsidiaries)} Suc.</span>
                        <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxSpaces)} Canchas</span>
                        <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxUsers)} Usuarios</span>
                        <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxInvoicesMonthly)} Facturas/mes</span>
                        <span className="register_plan_limit_pill">{NOTIFICATIONS_TIER_LABELS[plan.notificationsTier] ?? plan.notificationsTier}</span>
                        {plan.hasAdvancedReports && <span className="register_plan_purple_pill">Reportes avanzados</span>}
                        {plan.allowsMultiCompany && <span className="register_plan_purple_pill">Multi empresa</span>}
                    </div>

                    <ul className="register_plan_features">
                        {plan.features.slice(0, FEATURES_PREVIEW_LIMIT).map((feature, index) => (
                            <li key={`${feature}-${index}`}>
                                <Check size={14} />
                                <span>{feature}</span>
                            </li>
                        ))}
                        {plan.features.length > FEATURES_PREVIEW_LIMIT && (
                            <li className="register_plan_features_more">+{plan.features.length - FEATURES_PREVIEW_LIMIT} más</li>
                        )}
                    </ul>
                </button>
            ))}
        </div>
    </FormSection>
);

export default PlanStepForm;
