import { Check, Gift, Pencil, Trash2 } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { usePlans } from '../hooks/usePlans';
import { PlanEdit } from '../components/PlanEdit';
import '../styles/CatalogPage.css';
import '../styles/PlansPage.css';
import { Button } from '../../../shared/components';

const FEATURES_PREVIEW_LIMIT = 5; // cuántas características se muestran antes del "+N más"
const UNLIMITED_LIMIT = 999; // convención del backend para "ilimitado" en max_subsidiaries/max_spaces/max_users (ver comentario del modelo SaaSPlan)

// Formatea un límite numérico del plan — "∞" cuando alcanza el tope de "ilimitado".
const formatPlanLimit = (value: number) => (value >= UNLIMITED_LIMIT ? '∞' : value);

const NOTIFICATIONS_TIER_LABELS: Record<string, string> = {
    basic: 'Notif. básicas',
    full: 'Notif. full',
};

// Listado en cards, edición y eliminación de planes SaaS.
const PlansPage = () => {
    const {
        items, isLoading,
        openEdit, closeEdit, isEditOpen, form, setField, handleSubmit, isSaving,
        newFeature, setNewFeature, addFeature, removeFeature,
        deletingPlan, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
    } = usePlans();

    return (
        <div className="catalog_page">
            <Header title="Planes SaaS" subtitle="Administra los planes de suscripción del sistema" icon={Gift} />

            {isLoading ? (
                <div className="plan_cards_state">Cargando...</div>
            ) : items.length === 0 ? (
                <div className="plan_cards_state">No hay planes registrados</div>
            ) : (
                <div className="plan_cards_grid">
                    {items.map((plan) => (
                        <div className="plan_card" key={plan.publicId}>
                            <div className="plan_card_header">
                                <span className="plan_card_name">{plan.name}</span>
                                <span className="plan_card_badge">{plan.code}</span>
                            </div>

                            <div className="plan_card_prices">
                                <div className="plan_card_price_box">
                                    <span className="plan_card_price_label">Mensual</span>
                                    <div className="price_box">
                                        <strong className="plan_card_price_value">${Number(plan.priceMonthly).toFixed(2)}</strong>
                                        <span className="plan_card_price_period">/mes</span>
                                    </div>
                                </div>
                                <div className="plan_card_price_box">
                                    <span className="plan_card_price_label">Anual</span>
                                    <div className='price_box'>
                                        <strong className="plan_card_price_value">${Number(plan.priceYearly).toFixed(2)}</strong>
                                        <span className="plan_card_price_period">/año</span>
                                    </div>
                                </div>
                            </div>

                            <div className="plan_card_limits">
                                <span className="plan_card_limit_pill">{formatPlanLimit(plan.maxSubsidiaries)} Suc.</span>
                                <span className="plan_card_limit_pill">{formatPlanLimit(plan.maxSpaces)} Canchas</span>
                                <span className="plan_card_limit_pill">{formatPlanLimit(plan.maxUsers)} Usuarios</span>
                                <span className="plan_card_limit_pill">{formatPlanLimit(plan.maxInvoicesMonthly)} Facturas/mes</span>
                                <span className="plan_card_limit_pill">{NOTIFICATIONS_TIER_LABELS[plan.notificationsTier] ?? plan.notificationsTier}</span>
                                {plan.hasAdvancedReports && <span className="plan_card_stripe_pill">Reportes avanzados</span>}
                                {plan.allowsMultiCompany && <span className="plan_card_stripe_pill">Multi empresa</span>}
                            </div>

                            <ul className="plan_card_features">
                                {plan.features.slice(0, FEATURES_PREVIEW_LIMIT).map((feature, index) => (
                                    <li key={`${feature}-${index}`}>
                                        <Check size={14} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {plan.features.length > FEATURES_PREVIEW_LIMIT && (
                                    <li className="plan_card_features_more">+{plan.features.length - FEATURES_PREVIEW_LIMIT} más</li>
                                )}
                            </ul>

                            <div className="plan_card_actions">
                                <Button
                                    text='Editar'
                                    icon={Pencil}
                                    onClick={() => openEdit(plan)}
                                />
                                <Button
                                    text='Eliminar'
                                    icon={Trash2}
                                    onClick={() => openDelete(plan)}
                                    color='danger'
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PlanEdit
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                form={form}
                onFieldChange={setField}
                newFeature={newFeature}
                onNewFeatureChange={setNewFeature}
                onAddFeature={addFeature}
                onRemoveFeature={removeFeature}
                isSaving={isSaving}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar plan"
                description={`¿Seguro que deseas eliminar "${deletingPlan?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
        </div>
    );
};

export default PlansPage;
