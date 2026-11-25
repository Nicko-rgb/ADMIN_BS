import { useState } from 'react';
import {
    Settings, Pencil, Store, Plus, Users, MapPin, Globe, Gift, ShieldCheck,
    UserCog, Phone, FileText, Mail, Calendar, Building2, UserCircle, CardSim,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingScreen, NotFoundScreen, ForbiddenScreen, EmptyScreen } from '../../../shared/components';
import { usePageHeader } from '../../../shared/store/headerStore';
import { PlanUsageBar } from '../../saas/components/PlanUsageBar';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDateText } from '../../../shared/utils/formatDate';
import { DOCUMENT_TYPE_LABELS, ROLE_LABELS, ROLE_MANAGE_PERMISSIONS } from '../../users/utils/userConstants';
import { ManageUserPermissions } from '../../users/components/ManageUserPermissions';
import CompanyEdit from '../components/CompanyEdit';
import SucursalForm from '../components/SucursalForm';
import UserAsingSucursal from '../components/UserAsingSucursal';
import useCompany from '../hooks/useCompany';
import '../styles/Company.css';

const ENABLED_LABELS = { A: 'Activo', I: 'Inactivo', P: 'Pendiente' } as const;
const ENABLED_CLASSNAMES = { A: 'active', I: 'inactive', P: 'pending' } as const;

const SUCURSAL_STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const SUCURSAL_STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

const Company = () => {
    const {
        company, subsidiaries, users, branchesStatus, usersStatus, isLoading, errorStatus, errorMessage, retry, planUsage,
        isEditCompanyOpen, openEditCompany, closeEditCompany, isSavingCompany,
        handleSubmitCompanyEdit, companyEditProps,
        openRegisterSucursal, isUserModalOpen, openUserModal, closeUserModal,
        isRegisterSucursalOpen, closeRegisterSucursal,
    } = useCompany();

    const navigate = useNavigate();

    const can = usePermission();
    const canManageCompanyUsers = can(ROLE_MANAGE_PERMISSIONS.administrador, ROLE_MANAGE_PERMISSIONS.empleado);
    const canManagePermissions = can('user.permission_manage');

    const [managingUser, setManagingUser] = useState<{ publicId: string; name: string } | null>(null);

    // Los hooks van SIEMPRE antes de cualquier return condicional. El header se
    // configura con datos opcionales y se actualiza solo cuando llega la empresa.
    usePageHeader({
        visible: Boolean(company) && !errorStatus,
        showCard: false,
        breadcrumbs: [
            { label: 'Empresas', path: '/companys' },
            { label: company?.name ?? 'Cargando...' },
        ],
        documentTitle: errorStatus ? undefined : company?.name,
    });

    if (isLoading) {
        return <LoadingScreen message="Cargando empresa..." size="sm" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'La empresa que buscás no existe.'} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage || 'No tenés acceso a esta empresa.'} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen message={errorMessage} onRetry={retry} />;
    }

    if (!company) {
        return <LoadingScreen message="Empresa no encontrada..." size="sm" />;
    }

    const owner = users.find((u) => u.role === 'super_admin') ?? null;
    const isPrimary = company.publicId === planUsage?.primaryCompany?.publicId;

    return (
        <div className="company_page">
            {/* ── Hero / Banner unificado ──────────────────────────── */}
            <div className="banner">
                <div className="kicker"><Building2 size={15} /> PERFIL DE EMPRESA</div>
                <div className="hero_main">
                    <div className="avatar center">{company.name.charAt(0).toUpperCase()}</div>
                    <div className="hero_content">
                        <h1 className="name_company">{company.name}</h1>
                        <div className="badges">
                            <span className={`status_badge ${ENABLED_CLASSNAMES[company.isEnabled!]}`}>
                                {ENABLED_LABELS[company.isEnabled!]}
                            </span>
                            <span className="plan"><Gift size={15} />Plan {planUsage?.planName || '-'}</span>
                            <span className={`${isPrimary ? 'primary' : 'secondary'}`}>{isPrimary ? 'Empresa Primaria' : 'Empresa Sucundaria'} </span>
                        </div>
                    </div>
                    <div className="actions">
                        <Button
                            text="Editar"
                            icon={Pencil}
                            onClick={openEditCompany}
                        />
                        <Button
                            text="Configurar Pagos"
                            icon={Settings}
                            color="secondary"
                            onClick={() => navigate(`/company/payments/config?company=${company.publicId}`)}
                        />
                    </div>
                </div>

                {/* Metadatos de la empresa */}
                <div className="hero_meta">
                    <div className="meta_item card" title="Fecha de registro">
                        <h4><CardSim size={18} />RUC/DOCUMENTO</h4>
                        <span>{company.document}</span>
                    </div>
                    <div className="meta_item card" title="Dirección">
                        <h4><MapPin size={18} />Dirección</h4>
                        <span>{company.address || '—'}</span>
                    </div>

                    <div className="meta_item card" title={company.ubigeo?.formatted}>
                        <h4><Globe size={18} />Ubicación</h4>
                        <span>
                            <img src={company.country?.flagUrl} alt={company.country?.name} />
                            <span>{company.country?.name} · {company.ubigeo?.formatted}</span>
                        </span>
                    </div>

                    <div className="meta_item card" title="Teléfonos">
                        <h4><Phone size={18} />teléfonos</h4>
                        <span>{formatPhone(company.country?.phoneCode, company.phoneCell)} - Fijo: {company.phone}</span>
                    </div>

                    <div className="meta_item card" title="Fecha de registro">
                        <h4><Calendar size={18} />Registro</h4>
                        <span>{formatDateText(company.createdAt)}</span>
                    </div>
                </div>

                {/* Sección compacta del dueño en chips */}
                <div className="hero_owner">
                    <h3 className="owner_label"><UserCircle size={16} />DUEÑO:</h3>
                    {usersStatus === 'loading' ? <span className="owner_empty">Cargando dueño...</span> : usersStatus === 'error' ? <span className="owner_empty">No se pudo cargar el dueño.</span> : owner ? (
                        <div className="owner_chips">
                            <span className="owner_chip name_chip">
                                <strong>{`${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() || '—'}</strong>
                            </span>
                            <span className="owner_chip" title="Documento de identidad">
                                <FileText size={14} />
                                <span>{owner.documentType ? `${DOCUMENT_TYPE_LABELS[owner.documentType]} ` : ''}{owner.documentNumber}</span>
                            </span>
                            <span className="owner_chip" title="Teléfono">
                                <Phone size={14} />
                                <span>{formatPhone(owner.country?.phoneCode, owner.phone)}</span>
                            </span>
                            <span className="owner_chip" title="Correo">
                                <Mail size={14} />
                                <span>{owner.email}</span>
                            </span>
                            <span className="owner_chip" title="País del dueño">
                                <img src={owner.country?.flagUrl} alt={owner.country?.name} className="owner_country" />
                                <span>{owner.country?.name}</span>
                            </span>
                        </div>
                    ) : (
                        <span className="owner_empty">Sin dueño asignado</span>
                    )}
                </div>
            </div>

            {/* ── Sección de Sucursales ────────────────────────────── */}
            <section className="section_company">
                <header className="header">
                    <span className="icon center"><Store size={19} /></span>
                    <div className="heading"><h2>Sucursales</h2><p>Gestiona las sedes y sus ubicaciones.</p></div>
                    <div className="controls">
                        <PlanUsageBar value={planUsage?.subsidiaries} label="Sucursales" />
                        <Button text="Sucursal" icon={Plus} onClick={openRegisterSucursal} />
                    </div>
                </header>
                {branchesStatus === 'loading' ?
                    <LoadingScreen message='Sucursales...' size='sm' />
                    : subsidiaries.length > 0 ? (
                        <div className="subsidiaries_grid">
                            {subsidiaries.map((subsidiary) => (
                                <article className="subsidiary_card card" key={subsidiary.publicId}>
                                    <div className="header">
                                        <div className="avatar center">{subsidiary.name.charAt(0).toUpperCase()}</div>
                                        <h3 className="name">{subsidiary.name}</h3>
                                    </div>
                                    <div><span className={`status_badge ${SUCURSAL_STATUS_CLASSNAMES[subsidiary.status!]}`}>{SUCURSAL_STATUS_LABELS[subsidiary.status!]}</span></div>
                                    <div className="info">
                                        <p><MapPin size={18} /><span>{subsidiary.address}</span></p>
                                        <p><Globe size={18} /><span>{subsidiary.ubigeo}</span></p>
                                    </div>
                                    <div className="card_actions">
                                        <Button
                                            text="Administrar"
                                            icon={Settings}
                                            color="secondary"
                                            onClick={() => navigate(`/company/sucursal/${subsidiary.publicId}`)}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyScreen message='Aún no tienes sucursales registradas' icon={Store} size='sm' />
                    )}
            </section>

            {/* ── Sección de Usuarios ──────────────────────────────── */}
            <section className="section_company">
                <header className="header">
                    <span className="icon center"><Users size={19} /></span>
                    <div className="heading"><h2>Usuarios</h2><p>Personas con acceso a esta empresa.</p></div>
                    <div className="controls">
                        <PlanUsageBar value={planUsage?.users} label="Usuarios" />
                        {canManageCompanyUsers && (
                            <Button text="Nuevo Usuario" icon={Plus} onClick={openUserModal} disabled={branchesStatus !== 'ready'} />
                        )}
                    </div>
                </header>
                {usersStatus === 'loading' ?
                    <LoadingScreen message='Sucursales...' size='sm' />
                    : users.length > 0 ? (
                        <div className="users_grid">
                            {users.map((user) => (
                                <article className="user_card card" key={user.publicId}>
                                    <div className="header">
                                        <span className="avatar center" aria-hidden="true">{user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
                                        <span className="name">{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'}</span>
                                        <span className={`role ${user.role}`}>{ROLE_LABELS[user.role]}</span>
                                    </div>
                                    <div className="info">
                                        <p>{user.email ?? 'Sin Email'}</p>
                                        <p>{formatPhone(user.country?.phoneCode, user.phone) || '—'}</p>
                                        <p>
                                            <img src={user.country?.flagUrl} alt={user.country?.name} />
                                            <span>{user.country?.name}</span>
                                        </p>
                                    </div>

                                    <div className="user_sucursales">
                                        {user.sucursales.map((sucursal) => (
                                            <span className="sucursal_pill center" key={sucursal.publicId}>
                                                <Store size={16} />{sucursal.name ?? '—'}
                                            </span>
                                        ))}
                                    </div>
                                    {canManagePermissions && (
                                        <div className="card_actions">
                                            <Button
                                                text="Permisos"
                                                icon={ShieldCheck}
                                                color="secondary"
                                                onClick={() => setManagingUser({
                                                    publicId: user.publicId,
                                                    name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—',
                                                })}
                                            />
                                            <Button
                                                text="Gestionar"
                                                icon={UserCog}
                                                color="secondary"
                                                disabled
                                                onClick={() => { }}
                                            />
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyScreen message='Todavía no hay usuarios' />
                    )}
            </section>

            <CompanyEdit
                isOpen={isEditCompanyOpen}
                onClose={closeEditCompany}
                onSubmit={handleSubmitCompanyEdit}
                isSaving={isSavingCompany}
                fields={companyEditProps}
            />

            {canManageCompanyUsers && isUserModalOpen && (
                <UserAsingSucursal
                    onClose={closeUserModal}
                    subsidiaries={subsidiaries}
                    onSaved={retry}
                />
            )}

            {canManagePermissions && (
                <ManageUserPermissions
                    publicId={managingUser?.publicId ?? null}
                    userName={managingUser?.name ?? ''}
                    onClose={() => setManagingUser(null)}
                />
            )}

            { isRegisterSucursalOpen && (
                <SucursalForm
                    companyPublicId={company.publicId}
                    sucursalPublicId={null}
                    onClose={closeRegisterSucursal}
                    onSaved={retry}
                />
            )}
        </div>
    );
};

export default Company;
