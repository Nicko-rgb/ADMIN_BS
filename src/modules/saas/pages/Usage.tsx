import {
    AlertCircle, AlertTriangle, Building2, CalendarDays, Check, CircleHelp,
    Clock3, Crown, FileText, Grid2x2, Layers, MapPin, RefreshCw, Store, Users, X,
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { EmptyScreen, LoadingScreen } from '../../../shared/components/ScreenMessage';
import { PlanUsageBar } from '../components/PlanUsageBar';
import { useUsage } from '../hooks/useUsage';
import { describePlanUsage, formatPlanLimit } from '../utils/planUsage';
import '../styles/Usage.css';

const Usage = () => {
    const { companyPublicId, data, isLoading, error, reload, features, additionalFeatures, alerts,
        subscriptionState, periodStart, periodEnd, updatedAt, branchCount, spaceCount } = useUsage();

    if (!companyPublicId) return <EmptyScreen icon={Building2} message="No tienes una empresa asociada para consultar el uso de un plan." />;
    if (isLoading ) return <LoadingScreen message="Consultando uso..." size='sm' />;
    if (error) return <EmptyScreen icon={AlertCircle} message={error} actionText="Volver a intentar" iconBtn={RefreshCw} onAction={reload} />;
    if (!data) return <EmptyScreen icon={Crown} message="No hay información de uso disponible para tu empresa." />;

    return (
        <div className="usage_page" aria-busy={isLoading}>
            <section className="usage_plan" aria-labelledby="usage-plan-title">

                <div className="plan_topline">
                    <span className="plan_kicker"><Crown size={15} />Tu plan actual</span>
                    <span className="plan_updated"><Clock3 size={14} />Actualizado a las {updatedAt}</span>
                </div>

                <div className="plan_heading">
                    <div className="plan_identity">
                        <span className="plan_icon"><Crown size={26} /></span>
                        <div className="plan_name">
                            <h2 id="usage-plan-title">{data.subscription.plan?.name}</h2>
                            <p>{data.subscription.primaryCompany?.name ?? data.company.name}</p>
                            <div className="plan_badges">
                                <span className={`usage_badge ${subscriptionState?.tone}`}>{subscriptionState?.label}</span>
                                <span className={`usage_badge ${data.subscription.isEffective ? 'success' : 'warning'}`}>
                                    {data.subscription.isEffective ? <Check size={13} /> : <AlertCircle size={13} />}
                                    {data.subscription.isEffective ? 'Plan vigente' : 'Plan sin vigencia'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button className="usage_refresh" text="Actualizar" icon={RefreshCw} color="secondary" loading={isLoading} onClick={reload} />
                </div>

                <div className="plan_facts">
                    <div><span><Building2 size={15} />Empresa titular</span><strong>{data.subscription.primaryCompany?.name ?? 'Sin titular definido'}</strong></div>
                    <div><span><CalendarDays size={15} />Período de la suscripción</span><strong>{periodStart} — {periodEnd}</strong></div>
                    <div><span><Layers size={15} />Modalidad</span><strong>{data.subscription.plan?.allowsMultiCompany ? 'Multiempresa' : 'Una empresa'}</strong></div>
                </div>

                {!data.subscription.isEffective && <p className="plan_notice"><AlertCircle size={16} />Tu plan no está vigente. Revisa tu suscripción para continuar utilizando sus beneficios.</p>}
                {data.subscription.cancelAtPeriodEnd && data.subscription.isEffective && <p className="plan_notice"><CalendarDays size={16} />La cancelación está programada para el final del período actual.</p>}
            </section>

            <section className="usage_summary" aria-label="Resumen de recursos">
                <article className="summary_item">
                    <span className="summary_icon"><Building2 size={19} /></span>
                    <span className="summary_label">Empresas del plan</span>
                    <strong>{data.companies.used}<small> / {data.companies.max ?? '∞'}</small></strong>
                    <p>{data.companies.max === null ? 'Tu plan permite múltiples empresas' : 'Empresa incluida en tu suscripción'}</p>
                </article>
                <article className="summary_item">
                    <span className="summary_icon lavender"><Store size={19} /></span>
                    <span className="summary_label">Sucursales registradas</span>
                    <strong>{branchCount}</strong>
                    <p>El límite se aplica por empresa</p>
                </article>
                <article className="summary_item">
                    <span className="summary_icon blue"><Grid2x2 size={19} /></span>
                    <span className="summary_label">Canchas y espacios</span>
                    <strong>{spaceCount}</strong>
                    <p>El límite se aplica por sucursal</p>
                </article>
            </section>

            {alerts.length > 0 && (
                <section className="usage_alerts" aria-label="Avisos de capacidad" aria-live="polite">
                    <div className="alerts_heading">
                        <span className="alerts_icon"><AlertCircle size={19} /></span>
                        <div><h2>Atención a tu capacidad</h2><p>Revisa estos límites antes de que se conviertan en un bloqueo.</p></div>
                    </div>
                    <ul>{alerts.map((alert) => (
                        <li key={alert.key} className={alert.tone}>
                            {alert.tone === 'danger' ? <AlertCircle size={16} /> : <AlertTriangle size={16} />}
                            {alert.message}
                        </li>
                    ))}</ul>
                </section>
            )}

            <section className="usage_companies" aria-labelledby="usage-companies-title">
                <div className="usage_section_heading">
                    <div>
                        <span className="section_kicker">Capacidad</span>
                        <h2 id="usage-companies-title">Uso por empresa y sucursal</h2>
                        <p>Consulta los cupos de cada empresa y el detalle de sus instalaciones.</p>
                    </div>
                    <div className="usage_legend"><span><i />Disponible</span><span><i className="warning" />Desde 80 %</span><span><i className="full" />Al límite</span></div>
                </div>

                <div className="company_list">
                    {data.companyUsage.map((company) => (
                        <article className="company_usage" key={company.publicId}>
                            <div className="company_heading">
                                <span className="company_avatar"><Building2 size={20} /></span>
                                <div className="company_name">
                                    <h3>{company.name}</h3>
                                    <p>{company.branches.length === 1 ? '1 sucursal registrada' : `${company.branches.length} sucursales registradas`}</p>
                                </div>
                                {company.isPrimary && <span className="usage_badge neutral">Titular del plan</span>}
                            </div>

                            <div className="company_metrics">
                                <div className="usage_metric">
                                    <span className="metric_icon"><MapPin size={16} /></span>
                                    <div className="metric_body">
                                        <PlanUsageBar value={company.subsidiaries} label="Sucursales de la empresa" />
                                        <p>{describePlanUsage(company.subsidiaries)}</p>
                                    </div>
                                </div>
                                <div className="usage_metric">
                                    <span className="metric_icon lavender"><Users size={16} /></span>
                                    <div className="metric_body">
                                        <PlanUsageBar value={company.users} label="Usuarios de la empresa" />
                                        <p>{describePlanUsage(company.users)} · Incluye al dueño y las asignaciones activas</p>
                                    </div>
                                </div>
                            </div>

                            {company.branches.length === 0 ? (
                                <div className="branch_empty">
                                    <EmptyScreen icon={MapPin} size="sm" message="Esta empresa todavía no tiene sucursales registradas." />
                                </div>
                            ) : (
                                <div className="branch_list">
                                    {company.branches.map((branch) => (
                                        <article className="branch_row" key={branch.publicId}>
                                            <div className="branch_identity">
                                                <span className="branch_icon"><MapPin size={16} /></span>
                                                <h4>{branch.name}</h4>
                                            </div>
                                            <div className="branch_metrics">
                                                <div className="branch_metric">
                                                    <PlanUsageBar value={branch.spaces} label="Canchas y espacios" />
                                                    <p>{describePlanUsage(branch.spaces)}</p>
                                                </div>
                                                <div className="branch_metric">
                                                    {branch.invoicesMonthly.used === null ? (
                                                        <>
                                                            <span className="invoice_pending"><FileText size={15} />Consumo no disponible</span>
                                                            <p>Límite mensual: {formatPlanLimit(branch.invoicesMonthly.max)}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlanUsageBar value={{ used: branch.invoicesMonthly.used, max: branch.invoicesMonthly.max }} label="Facturas del mes" />
                                                            <p>Por sucursal, cada mes</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>

                {!data.invoicesTrackingAvailable && <p className="usage_note"><CircleHelp size={16} />El consumo de facturas por sucursal aún no está disponible. Se muestra el límite de tu plan; no se contabilizan aquí los pagos de la suscripción.</p>}
                {data.companyUsage.length < data.companies.used && <p className="usage_note"><CircleHelp size={16} />El resumen del plan incluye {data.companies.used} empresas. El detalle muestra las empresas disponibles para tu usuario.</p>}
            </section>

            <section className="usage_features" aria-labelledby="usage-features-title">
                <div className="usage_section_heading">
                    <div>
                        <span className="section_kicker">Beneficios</span>
                        <h2 id="usage-features-title">Características de tu plan</h2>
                        <p>Los beneficios incluidos en tu suscripción actual.</p>
                    </div>
                    <span className="features_mark"><Crown size={20} /></span>
                </div>

                <div className="features_grid">{features.map((feature) => (
                    <article className={`feature_item ${feature.included ? 'included' : 'excluded'}`} key={feature.label}>
                        <span className="feature_icon">{feature.included ? <Check size={16} /> : <X size={16} />}</span>
                        <div className="feature_body"><h3>{feature.label}</h3><p>{feature.detail}</p></div>
                        <span className="feature_state">{feature.included ? 'Incluido' : 'No incluido'}</span>
                    </article>
                ))}</div>

                {additionalFeatures.length > 0 && (
                    <ul className="additional_features">{additionalFeatures.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
                )}
            </section>
        </div>
    );
};

export default Usage;
