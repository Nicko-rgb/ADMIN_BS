import { useState } from 'react';
import {
    Settings, Pencil, Store, Plus, Users, MapPin, Globe,
    Gift, ShieldCheck, UserCog, Phone, FileText, User, Mail, Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header, Button, LoadingScreen, NotFoundScreen, PlanUsageBar, ForbiddenScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import { DOCUMENT_TYPE_LABELS, ROLE_LABELS, ROLE_MANAGE_PERMISSIONS } from '../../users/utils/userConstants';
import { ManageUserPermissions } from '../../users/components/ManageUserPermissions';
import CompanyEdit from '../components/CompanyEdit';
import UserAsingSucursal from '../components/UserAsingSucursal';
import useCompany from '../hooks/useCompany';
import '../styles/Company.css';

const ENABLED_LABELS = { A: 'Activo', I: 'Inactivo', P: 'Pendiente' } as const;
const ENABLED_CLASSNAMES = { A: 'active', I: 'inactive', P: 'pending' } as const;

const SUCURSAL_STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const SUCURSAL_STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

const Company = () => {
    const {
        company, isLoading, errorStatus, errorMessage, retry, planUsage,
        isEditCompanyOpen, openEditCompany, closeEditCompany, isSavingCompany,
        handleSubmitCompanyEdit, companyEditProps,
        openRegisterSucursal, isUserModalOpen, openUserModal, closeUserModal,
    } = useCompany();

    const navigate = useNavigate();

    const can = usePermission();
    const canEditCompany = can('company.edit');
    const canManageSucursales = can('sucursal.create');
    const canManageCompanyUsers = can(ROLE_MANAGE_PERMISSIONS.administrador, ROLE_MANAGE_PERMISSIONS.empleado);
    const canManagePermissions = can('user.permission_manage');

    const [managingUser, setManagingUser] = useState<{ publicId: string; name: string } | null>(null);

    if (isLoading) {
        return <LoadingScreen message="Cargando empresa..." size="lg" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'La empresa que buscás no existe.'} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage || 'No tenés acceso a esta empresa.'} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen title="Ocurrió un error" message={errorMessage} onRetry={retry} />;
    }

    if (!company) {
        return null;
    }

    const owner = company.users.find((u) => u.role === 'super_admin') ?? null;
    const isPrimary = company.publicId === planUsage?.primaryCompany?.publicId;

    return (
        <div className="company_detail_page">
            <Header title={company.name} breadcrumbs={[{ label: 'Empresas', path: '/companys' }]} showCard={false} />

            {/* ── Hero / Banner unificado ──────────────────────────── */}
            <div className="company_hero_banner card">
                <div className="company_hero_main">
                    <div className="company_hero_avatar center">
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="company_hero_content">
                        <div className="company_hero_title_row">
                            <h1>{company.name}</h1>
                            {company.isEnabled && (
                                <span className={`status_badge ${ENABLED_CLASSNAMES[company.isEnabled]}`}>
                                    {ENABLED_LABELS[company.isEnabled]}
                                </span>
                            )}
                            <span className="company_plan_badge">
                                <Gift size={14} />Plan {planUsage?.planName || '-'}
                            </span>
                            {isPrimary && (
                                <span className="company_primary_badge">Empresa Primaria</span>
                            )}
                        </div>
                        <span className="company_hero_document">RUC: {company.document}</span>
                    </div>
                    <div className="company_hero_actions">
                        {canEditCompany && (
                            <Button
                                text="Editar"
                                size="sm"
                                icon={Pencil}
                                onClick={openEditCompany}
                            />
                        )}
                        <Button
                            text="Configurar"
                            size="sm"
                            icon={Settings}
                            color="secondary"
                            onClick={() => {}}
                        />
                    </div>
                </div>

                {/* Metadatos de la empresa */}
                <div className="company_hero_meta">
                    <div className="meta_item" title="Dirección">
                        <MapPin size={16} />
                        <span>{company.address || '—'}</span>
                    </div>

                    {company.country && (
                        <div className="meta_item" title={company.ubigeo?.formatted ? `${company.country.name} - ${company.ubigeo.formatted}` : company.country.name}>
                            <Globe size={16} />
                            <div className="meta_country">
                                <img src={company.country.flagUrl} alt={company.country.name} />
                                <span>{company.country.name}{company.ubigeo?.formatted ? ` · ${company.ubigeo.formatted}` : ''}</span>
                            </div>
                        </div>
                    )}

                    <div className="meta_item" title="Teléfonos">
                        <Phone size={16} />
                        <span>
                            {formatPhone(company.country?.phoneCode, company.phoneCell) || '—'}
                            {company.phone ? ` · Fijo: ${formatPhone(company.country?.phoneCode, company.phone)}` : ''}
                        </span>
                    </div>

                    <div className="meta_item" title="Fecha de registro">
                        <Calendar size={16} />
                        <span>Registrada el {formatDate(company.createdAt)}</span>
                    </div>
                </div>

                {/* Sección compacta del dueño en chips */}
                <div className="company_hero_owner">
                    <div className="owner_label">
                        <User size={15} />
                        <span>Dueño:</span>
                    </div>
                    {owner ? (
                        <div className="owner_chips_list">
                            <span className="owner_chip name_chip">
                                <strong>{`${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() || '—'}</strong>
                            </span>
                            {owner.documentNumber && (
                                <span className="owner_chip" title="Documento de identidad">
                                    <FileText size={14} />
                                    <span>
                                        {owner.documentType ? `${DOCUMENT_TYPE_LABELS[owner.documentType]} ` : ''}
                                        {owner.documentNumber}
                                    </span>
                                </span>
                            )}
                            {owner.phone && (
                                <span className="owner_chip" title="Teléfono">
                                    <Phone size={14} />
                                    <span>{formatPhone(owner.country?.phoneCode, owner.phone)}</span>
                                </span>
                            )}
                            {owner.email && (
                                <span className="owner_chip" title="Correo">
                                    <Mail size={14} />
                                    <span>{owner.email}</span>
                                </span>
                            )}
                            {owner.country && (
                                <span className="owner_chip" title="País del dueño">
                                    <img src={owner.country.flagUrl} alt={owner.country.name} className="owner_country_flag" />
                                    <span>{owner.country.name}</span>
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="owner_empty">Sin dueño asignado</span>
                    )}
                </div>
            </div>

            {/* ── Sección de Sucursales ────────────────────────────── */}
            <div className="section_company card">
                <div className="title_card">
                    <Store size={18} />
                    <h3>Sucursales</h3>
                    <PlanUsageBar value={planUsage?.subsidiaries} label="Sucursales" />
                    {canManageSucursales && (
                        <Button text="Nueva Sucursal" size="sm" icon={Plus} onClick={openRegisterSucursal} />
                    )}
                </div>
                {company.subsidiaries.length > 0 ? (
                    <div className="company_subsidiaries_grid">
                        {company.subsidiaries.map((subsidiary) => (
                            <div className="subsidiary_card" key={subsidiary.publicId}>
                                {subsidiary.status ? (
                                    <span className={`subsidiary_status_dot ${SUCURSAL_STATUS_CLASSNAMES[subsidiary.status]}`} title={SUCURSAL_STATUS_LABELS[subsidiary.status]} />
                                ) : null}
                                <div className="header">
                                    <div className="avatar center">{subsidiary.name.charAt(0).toUpperCase()}</div>
                                    <span className="name">{subsidiary.name}</span>
                                </div>
                                <div className="info">
                                    <p><MapPin /><span>{subsidiary.address}</span></p>
                                    <p><Globe /><span>{subsidiary.ubigeo}</span></p>
                                </div>
                                {canManageSucursales && (
                                    <Button
                                        text="Administrar"
                                        size="sm"
                                        icon={Settings}
                                        color="secondary"
                                        className="action"
                                        onClick={() => navigate(`/companys/company/sucursal/${subsidiary.publicId}`)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="company_empty_state">
                        <Store size={26} />
                        <span>Todavía no tiene sucursales</span>
                    </div>
                )}
            </div>

            {/* ── Sección de Usuarios ──────────────────────────────── */}
            <div className="section_company card">
                <div className="title_card">
                    <Users size={18} />
                    <h3>Usuarios</h3>
                    <PlanUsageBar value={planUsage?.users} label="Usuarios" />
                    {canManageCompanyUsers && (
                        <Button text="Nuevo Usuario" size="sm" icon={Plus} onClick={openUserModal} />
                    )}
                </div>
                {company.users.length > 0 ? (
                    <div className="users_grid">
                        {company.users.map((user) => (
                            <div className="card" key={user.publicId}>
                                <div className="header">
                                    <span className="name">{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'}</span>
                                    <span className={`role ${user.role}`}>{ROLE_LABELS[user.role]}</span>
                                </div>
                                <div className="info">
                                    <span>{user.email ?? '—'}</span>
                                    <span>{formatPhone(user.country?.phoneCode, user.phone) || '—'}</span>
                                </div>
                                {user.country && (
                                    <div className="user_country">
                                        <img src={user.country.flagUrl} alt={user.country.name} />
                                        <span>{user.country.name}</span>
                                    </div>
                                )}
                                <div className="user_sucursales">
                                    {user.sucursales.map((sucursal) => (
                                        <span className="sucursal_pill" key={sucursal.publicId}>
                                            <Store size={18} />{sucursal.name ?? '—'}
                                        </span>
                                    ))}
                                </div>
                                {canManagePermissions && (
                                    <div className="user_card_actions">
                                        <Button
                                            text="Permisos"
                                            size="sm"
                                            icon={ShieldCheck}
                                            color="secondary"
                                            onClick={() => setManagingUser({
                                                publicId: user.publicId,
                                                name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—',
                                            })}
                                        />
                                        <Button
                                            text="Gestionar"
                                            size="sm"
                                            icon={UserCog}
                                            color="secondary"
                                            disabled
                                            onClick={() => {}}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="company_empty_state">
                        <Users size={26} />
                        <span>Todavía no hay usuarios</span>
                    </div>
                )}
            </div>

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
                    subsidiaries={company.subsidiaries}
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
        </div>
    );
};

export default Company;
