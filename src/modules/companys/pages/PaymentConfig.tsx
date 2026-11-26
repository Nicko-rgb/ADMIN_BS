import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Banknote, Bitcoin, Building2, ChevronDown, ChevronRight, Clock,
    CreditCard, Globe, Landmark, Percent, ShieldCheck, Store, Wallet, Wifi, WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmptyScreen, ForbiddenScreen, LoadingScreen, NotFoundScreen } from '../../../shared/components';
import { Button } from '../../../shared/components/Button';
import { usePageHeader } from '../../../shared/store/headerStore';
import { usePermission } from '../../../shared/hooks/usePermission';
import usePaymentConfig from '../hooks/usePaymentConfig';
import MercadoPagoForm from '../components/MercadoPagoForm';
import PaymentAccountForm from '../components/PaymentAccountForm';
import type { PaymentConfigBranch } from '../interfaces/paymentConfig.interface';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import { formatPaymentCommission } from '../../../shared/utils/formatPaymentCommission';
import '../styles/PaymentConfig.css';

const CATEGORY_LABELS: Record<string, string> = {
    tarjeta_credito: 'Tarjetas de crédito',
    tarjeta_debito: 'Tarjetas de débito',
    transferencia_bancaria: 'Transferencias bancarias',
    billetera_digital: 'Billeteras digitales',
    efectivo: 'Efectivo',
    criptomoneda: 'Criptomonedas',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    tarjeta_credito: CreditCard,
    tarjeta_debito: CreditCard,
    transferencia_bancaria: Landmark,
    billetera_digital: Wallet,
    efectivo: Banknote,
    criptomoneda: Bitcoin,
};

const STATUS_LABELS: Record<NonNullable<PaymentConfigBranch['status']>, string> = {
    ACTIVE: 'Activa',
    INACTIVE: 'Inactiva',
    MAINTENANCE: 'Mantenimiento',
};

const STATUS_CLASSNAMES: Record<NonNullable<PaymentConfigBranch['status']>, string> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
};

const categoryIcon = (category: string): LucideIcon => CATEGORY_ICONS[category] ?? CreditCard;

// Mercado Pago se identifica por proveedor: hoy lo usan tarjeta en línea y Yape.
// El estado mostrado es el de la sucursal seleccionada, no el del tipo de pago.
const isMercadoPago = (provider: string | null) =>
    (provider ?? '').trim().toLowerCase() === 'mercado pago';

const branchCountLabel = (count: number) => count === 1 ? '1 sucursal' : `${count} sucursales`;

const methodCountLabel = (count: number) => count === 1 ? '1 método' : `${count} métodos`;

/**
 * Configuración de pagos de una empresa y sus sucursales.
 *
 * Árbol empresa → sucursales; al elegir una sucursal se listan los tipos de
 * pago activos de su país (más los globales) y el estado de su cuenta de
 * Mercado Pago, que se puede conectar o desconectar desde el modal.
 */
const PaymentConfig = () => {
    const navigate = useNavigate();
    const can = usePermission();
    const canManagePayments = can('payment.account_manage');

    const {
        company, branches, isCompanyLoading, errorStatus, errorMessage,
        branchesStatus, branchesError, selectedBranch, selectBranch,
        paymentTypes, typesStatus, typesError, retry, retryTypes,
        mpConnected, mpStatus, mpError, reloadMercadoPago,
        manualAccounts, accountsStatus, accountsError, reloadManualAccounts,
    } = usePaymentConfig(canManagePayments);

    const [isTreeOpen, setIsTreeOpen] = useState(true);

    const [paymentForm, setPaymentForm] = useState<{
        branch: PaymentConfigBranch;
        type: PaymentType;
        isOpen: boolean;
    } | null>(null);
    const closeForm = () => setPaymentForm((form) => form && { ...form, isOpen: false });
    const clearClosedForm = () => setPaymentForm((form) => form?.isOpen ? form : null);

    usePageHeader({
        title: 'Configuración de pagos',
        subtitle: company ? `Cuentas y credenciales de ${company.name}` : 'Cuentas y credenciales por sucursal',
        icon: CreditCard,
        breadcrumbs: [
            { label: 'Empresas', path: '/companys' },
            ...(company ? [{ label: company.name, path: `/company/${company.publicId}` }] : []),
            { label: 'Pagos' },
        ],
        documentTitle: company ? `Pagos · ${company.name}` : 'Pagos',
    });

    const groupedTypes = useMemo(() => {
        const groups = new Map<string, PaymentType[]>();
        paymentTypes.forEach((type) => {
            const list = groups.get(type.category) ?? [];
            list.push(type);
            groups.set(type.category, list);
        });
        return [...groups.entries()].map(([category, types]) => ({ category, types }));
    }, [paymentTypes]);

    if (!canManagePayments) {
        return <ForbiddenScreen message="No tenés permiso para configurar los pagos de la empresa." onBack={() => navigate('/companys')} />;
    }

    if (isCompanyLoading) {
        return <LoadingScreen message="Cargando empresa..." size="sm" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'La empresa que buscás no existe.'} onBack={() => navigate('/companys')} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage || 'No tenés acceso a esta empresa.'} onBack={() => navigate('/companys')} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen message={errorMessage} onRetry={retry} onBack={() => navigate('/companys')} />;
    }

    if (!company) {
        return <LoadingScreen message="Empresa no encontrada..." size="sm" />;
    }

    return (
        <div className="payment_config_page">
            {/* ── Árbol: empresa → sucursales ───────────────────────── */}
            <aside className="payment_config_tree card">
                <header className="section_header">
                    <span className="icon_box"><Store size={17} /></span>
                    <div className="heading">
                        <h2>Sucursales</h2>
                        <p>Elegí una sede para ver sus métodos de pago</p>
                    </div>
                </header>

                <div className="tree_body">
                    <button
                        type="button"
                        className="tree_node tree_company"
                        onClick={() => setIsTreeOpen((open) => !open)}
                        aria-expanded={isTreeOpen}
                    >
                        <span className="node_icon"><Building2 size={16} /></span>
                        <span className="node_text">
                            <strong>{company.name}</strong>
                            <small>{company.country?.name ?? 'Sin país'} · {branchCountLabel(branches.length)}</small>
                        </span>
                        {company.country && <img className="node_flag" src={company.country.flagUrl} alt="" />}
                        {isTreeOpen ? <ChevronDown size={16} className="node_chevron" /> : <ChevronRight size={16} className="node_chevron" />}
                    </button>

                    {isTreeOpen && (
                        <div className="tree_children">
                            {branchesStatus === 'loading' && <LoadingScreen message="Sucursales..." size="sm" />}

                            {branchesStatus === 'error' && (
                                <EmptyScreen
                                    message={branchesError || 'No se pudieron cargar las sucursales'}
                                    size="sm"
                                    actionText="Reintentar"
                                    onAction={retry}
                                />
                            )}

                            {branchesStatus === 'ready' && branches.length === 0 && (
                                <EmptyScreen message="Esta empresa todavía no tiene sucursales" icon={Store} size="sm" />
                            )}

                            {branchesStatus === 'ready' && branches.map((branch) => {
                                const isActive = selectedBranch?.publicId === branch.publicId;

                                return (
                                    <button
                                        key={branch.publicId}
                                        type="button"
                                        className={`tree_node tree_branch ${isActive ? 'active' : ''}`}
                                        onClick={() => selectBranch(branch)}
                                        aria-pressed={isActive}
                                    >
                                        <span className="node_icon"><Store size={15} /></span>
                                        <span className="node_text">
                                            <strong>{branch.name}</strong>
                                            <small>{branch.countryName ?? 'Sin país'} · {branch.address || 'Sin dirección'}</small>
                                        </span>
                                        {branch.status && (
                                            <span className={`status_badge ${STATUS_CLASSNAMES[branch.status]}`}>
                                                {STATUS_LABELS[branch.status]}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Detalle: tipos de pago del país de la sucursal ────── */}
            <section className="payment_config_detail card">
                {!selectedBranch ? (
                    <EmptyScreen
                        message="Seleccioná una sucursal del árbol para ver los métodos de pago disponibles en su país."
                        icon={Store}
                    />
                ) : (
                    <>
                        <header className="section_header">
                            <span className="icon_box"><Store size={17} /></span>
                            <div className="heading">
                                <h2>{selectedBranch.name}</h2>
                                <p>
                                    {selectedBranch.countryName
                                        ? `Métodos de pago disponibles en ${selectedBranch.countryName}`
                                        : 'Métodos de pago disponibles en el país de la sucursal'}
                                </p>
                            </div>
                            <div className="header_actions">
                                {mpStatus === 'ready' && mpConnected && (
                                    <span className="mp_connected">
                                        <ShieldCheck size={13} />
                                        Mercado Pago MP
                                    </span>
                                )}
                                {typesStatus === 'ready' && (
                                    <span className="count_pill">{methodCountLabel(paymentTypes.length)}</span>
                                )}

                            </div>
                        </header>

                        <div className="detail_body">
                            {accountsStatus === 'error' && (
                                <EmptyScreen message={accountsError} size="sm" actionText="Reintentar cuentas" onAction={reloadManualAccounts} />
                            )}
                            {typesStatus === 'loading' && <LoadingScreen message="Tipos de pago..." size="sm" />}

                            {typesStatus === 'no_country' && (
                                <EmptyScreen
                                    message="La sucursal no tiene un país asignado. Editala para poder configurar sus pagos."
                                    icon={Globe}
                                    size="sm"
                                />
                            )}

                            {typesStatus === 'error' && (
                                <EmptyScreen
                                    message={typesError || 'No se pudieron cargar los tipos de pago'}
                                    size="sm"
                                    actionText="Reintentar"
                                    onAction={retryTypes}
                                />
                            )}

                            {typesStatus === 'ready' && paymentTypes.length === 0 && (
                                <EmptyScreen
                                    message="No hay tipos de pago activos para el país de esta sucursal."
                                    icon={CreditCard}
                                    size="sm"
                                />
                            )}

                            {typesStatus === 'ready' && paymentTypes.length > 0 && (
                                <div className="payment_types">
                                    {groupedTypes.map((group) => {
                                        const GroupIcon = categoryIcon(group.category);

                                        return (
                                            <section key={group.category} className="payment_types_group">
                                                <header className="group_header">
                                                    <span className="group_icon"><GroupIcon size={15} /></span>
                                                    <h3>{CATEGORY_LABELS[group.category] ?? group.category}</h3>
                                                    <span className="group_count">{group.types.length}</span>
                                                </header>

                                                <div className="payment_types_grid">
                                                    {group.types.map((type) => {
                                                        const TypeIcon = categoryIcon(type.category);
                                                        const commission = formatPaymentCommission(
                                                            type.commissionPercentage,
                                                            type.fixedCommission,
                                                            type.countryCurrency,
                                                        );
                                                        const showMpStatus = selectedBranch.supportsMercadoPago
                                                            && mpStatus === 'ready'
                                                            && isMercadoPago(type.provider);

                                                        const usesMp = isMercadoPago(type.provider);
                                                        const isCash = type.code.trim().toUpperCase() === 'CASH';
                                                        const account = manualAccounts.find((item) => item.paymentTypeId === type.id);

                                                        return (
                                                            <article key={type.id} className="payment_type_card">
                                                                <div className="type_header">
                                                                    <span className="type_icon">
                                                                        {type.iconUrl
                                                                            ? <img src={type.iconUrl} alt="" loading="lazy" />
                                                                            : <TypeIcon size={18} />}
                                                                    </span>
                                                                    <div className="type_title">
                                                                        <h4>{type.name}</h4>
                                                                        <span className="type_code">{type.code}</span>
                                                                    </div>
                                                                </div>

                                                                {type.description && (
                                                                    <p className="type_description">{type.description}</p>
                                                                )}

                                                                <div className="type_meta">
                                                                    {showMpStatus && (
                                                                        <span className={`mp_status ${mpConnected ? 'connected' : 'disconnected'}`}>
                                                                            {mpConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                                                            {mpConnected ? 'MP conectado' : 'MP sin conectar'}
                                                                        </span>
                                                                    )}
                                                                    {type.countryId == null && (
                                                                        <span className="type_chip global">
                                                                            <Globe size={12} />Global
                                                                        </span>
                                                                    )}
                                                                    {type.provider && (
                                                                        <span className="type_chip">
                                                                            <Building2 size={12} />{type.provider}
                                                                        </span>
                                                                    )}
                                                                    {type.processingTime && (
                                                                        <span className="type_chip">
                                                                            <Clock size={12} />{type.processingTime}
                                                                        </span>
                                                                    )}
                                                                    {commission && (
                                                                        <span className="type_chip">
                                                                            <Percent size={12} />{commission}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {usesMp && !isCash && (
                                                                    <p className="type_account_note">Cuenta de Mercado Pago compartida para Yape y tarjetas de esta sucursal.</p>
                                                                )}
                                                                {!usesMp && !isCash && (
                                                                    <p className="type_account_note">
                                                                        {accountsStatus === 'loading' ? 'Consultando cuenta…' : accountsStatus === 'error' ? 'No se pudo consultar la cuenta.' : account ? `${account.isActive ? 'Cuenta registrada' : 'Cuenta inactiva'}: ${account.account_name} · ${account.account_number}` : 'Sin cuenta registrada.'}
                                                                    </p>
                                                                )}
                                                                {isCash ? (
                                                                    <p className="type_account_note">No requiere conectar una cuenta.</p>
                                                                ) : (
                                                                    <Button
                                                                        text={usesMp ? (mpConnected ? 'Ver cuenta' : 'Conectar') : (accountsStatus !== 'ready' ? 'Ver cuenta' : account ? 'Ver cuenta' : 'Conectar')}
                                                                        icon={Wallet}
                                                                        iconPosition="left"
                                                                        color="accent"
                                                                        disabled={usesMp && !selectedBranch.supportsMercadoPago}
                                                                        onClick={() => setPaymentForm({ branch: selectedBranch, type, isOpen: true })}
                                                                    />
                                                                )}
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            {paymentForm && (isMercadoPago(paymentForm.type.provider) ? (
                <MercadoPagoForm
                    sucursalPublicId={paymentForm.branch.publicId}
                    sucursalName={paymentForm.branch.name}
                    isConnected={mpConnected}
                    status={mpStatus}
                    error={mpError}
                    isOpen={paymentForm.isOpen}
                    onClose={closeForm}
                    onAfterClose={clearClosedForm}
                    onRetry={reloadMercadoPago}
                    onChanged={reloadMercadoPago}
                />
            ) : (
                <PaymentAccountForm
                    key={`${paymentForm.branch.publicId}:${paymentForm.type.id}`}
                    branchName={paymentForm.branch.name}
                    paymentType={paymentForm.type}
                    branchPublicId={paymentForm.branch.publicId}
                    isOpen={paymentForm.isOpen}
                    onClose={closeForm}
                    onAfterClose={clearClosedForm}
                    onChanged={reloadManualAccounts}
                />
            ))}
        </div>
    );
};

export default PaymentConfig;
