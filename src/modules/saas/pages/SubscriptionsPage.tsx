import {
    ArrowUpRight, Building2, CalendarDays, Check, Clock3, CreditCard,
    FileText, Gauge, Gift, Users,
} from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import '../styles/SubscriptionsPage.css';

const usage = [
    { label: 'Empresas', used: '—', total: '—', icon: Building2 },
    { label: 'Usuarios', used: '—', total: '—', icon: Users },
    { label: 'Espacios', used: '—', total: '—', icon: Gauge },
];

const plans = [
    { name: 'Start', description: 'Para comenzar a administrar tu negocio.', price: '—', features: ['Gestión de empresa', 'Control de usuarios', 'Soporte estándar'] },
    { name: 'Pro', description: 'Más herramientas para equipos en crecimiento.', price: '—', features: ['Más usuarios y espacios', 'Reportes avanzados', 'Soporte prioritario'], featured: true },
    { name: 'Business', description: 'Administra varias empresas desde una cuenta.', price: '—', features: ['Grupo multiempresa', 'Límites ampliados', 'Herramientas avanzadas'] },
];

/** Maqueta visual de la gestión de suscripciones; todavía no consulta ni modifica datos. */
const SubscriptionsPage = () => (
    <div className="subscriptions_page">
        <Header title="Mi suscripción" subtitle="Consulta tu plan, consumo y facturación." icon={CreditCard} />

        <section className="subscriptions_current card">
            <div className="subscriptions_current_main">
                <div className="subscriptions_section_icon"><Gift size={21} /></div>
                <div>
                    <span className="subscriptions_overline">Plan actual</span>
                    <h2>Tu plan</h2>
                    <p>Resumen de la suscripción de tu grupo de empresas.</p>
                </div>
            </div>
            <div className="subscriptions_status_group">
                <span className="subscriptions_pill status">Estado de suscripción</span>
                <span className="subscriptions_pill effective"><Check size={14} />Vigencia</span>
            </div>
            <div className="subscriptions_facts">
                <div><span><Building2 size={15} />Empresa titular</span><strong>—</strong></div>
                <div><span><CalendarDays size={15} />Próxima factura</span><strong>—</strong></div>
                <div><span><CreditCard size={15} />Frecuencia</span><strong>—</strong></div>
            </div>
        </section>

        <section className="subscriptions_section card">
            <div className="subscriptions_section_heading">
                <div><h2>Consumo del plan</h2><p>Uso actual de los recursos incluidos en tu suscripción.</p></div>
                <span className="subscriptions_period">Período actual</span>
            </div>
            <div className="subscriptions_usage_grid">
                {usage.map(({ label, used, total, icon: Icon }) => (
                    <article className="subscriptions_usage_item" key={label}>
                        <div className="subscriptions_usage_title"><span><Icon size={17} />{label}</span><strong>{used}<small> / {total}</small></strong></div>
                        <div className="subscriptions_usage_track"><span /></div>
                        <p>Consumo del límite contratado</p>
                    </article>
                ))}
            </div>
        </section>

        <section className="subscriptions_section">
            <div className="subscriptions_section_heading">
                <div><h2>Planes disponibles</h2><p>Opciones para las necesidades de tu empresa.</p></div>
            </div>
            <div className="subscriptions_plans_grid">
                {plans.map((plan) => (
                    <article className={`subscriptions_plan_card card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
                        {plan.featured && <span className="subscriptions_recommended">Recomendado</span>}
                        <h3>{plan.name}</h3>
                        <p className="subscriptions_plan_description">{plan.description}</p>
                        <div className="subscriptions_price">{plan.price}<small> / período</small></div>
                        <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                        <button type="button" disabled>Ver plan <ArrowUpRight size={15} /></button>
                    </article>
                ))}
            </div>
        </section>

        <section className="subscriptions_section card subscriptions_history">
            <div className="subscriptions_section_heading">
                <div><h2>Historial de facturación</h2><p>Facturas y pagos asociados a tu suscripción.</p></div>
                <Clock3 size={19} />
            </div>
            <div className="subscriptions_history_empty"><FileText size={23} /><div><strong>Aún no hay movimientos</strong><p>Cuando se registren facturas o pagos, aparecerán aquí.</p></div></div>
        </section>
    </div>
);

export default SubscriptionsPage;
