import { Settings, Pencil, Store, Building2, User, Plus, Users, UploadCloud, UserCog, X, MapPin, Globe, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header, Button, Modal, LoadingScreen, NotFoundScreen, FormActions, PlanUsageBar, ForbiddenScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import { DOCUMENT_TYPE_LABELS, ROLE_LABELS, ROLE_MANAGE_PERMISSIONS } from '../../users/utils/userConstants';
import FormUserManage from '../../users/components/FormUserManage';
import CompanyEdit from '../components/CompanyEdit';
import UserAsingSucursal from '../components/UserAsingSucursal';
import useCompany from '../hooks/useCompany';
import '../styles/Company.css';

const ENABLED_LABELS = { A: 'Activo', I: 'Inactivo', P: 'Pendiente' } as const;
const ENABLED_CLASSNAMES = { A: 'active', I: 'inactive', P: 'pending' } as const;

// Detalle de una empresa — página de entidad: hero horizontal (avatar, nombre, estado y
// acciones en una sola fila, como .company_card de CompanysPage pero a tamaño de detalle),
// una única card de información partida en dos columnas (empresa | dueño, ver por qué en
// Company.css::.company_info_columns) y las sucursales al final en grid (solo nombre, la
// vista de detalle de sucursal todavía no existe). El fetch vive en useCompany.
const Company = () => {
    const {
        company, isLoading, errorStatus, errorMessage, retry, planUsage, isEditCompanyOpen, setOwnerEditField,
        openEditCompany, closeEditCompany, isSavingCompany, handleSubmitCompanyEdit, companyEditProps,
        openRegisterSucursal, isUserModalOpen, openUserModal, closeUserModal, isEditOwnerOpen,  openEditOwner, 
        closeEditOwner, isLoadingOwnerDetail, isSavingOwner, isOwnerEditValid, handleSubmitOwnerEdit, ownerEditValues,
    } = useCompany();

    const navigate = useNavigate()

    // Un super_admin edita su propio perfil desde /home/profile, no desde acá.
    const can = usePermission();
    const canEditOwner = can(ROLE_MANAGE_PERMISSIONS.super_admin);
    const canManageSucursales = can('sucursal.create');
    const canManageCompanyUsers = can(ROLE_MANAGE_PERMISSIONS.administrador, ROLE_MANAGE_PERMISSIONS.empleado);

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

    const isPrimary = company.publicId === planUsage?.primaryCompany?.publicId;

    return (
        <div className="company_detail_page">
            <Header title={company.name} breadcrumbs={[{ label: 'Empresas', path: '/companys' }]} showCard={false} />

            <div className="company_hero card">
                <div className="company_hero_identity">
                    <div className="company_avatar center">{company.name.charAt(0).toUpperCase()}</div>
                    <div className="company_hero_text">
                        <div className="company_hero_title_row">
                            <h1>{company.name}</h1>
                            {company.isEnabled ? (
                                <span className={`status_badge ${ENABLED_CLASSNAMES[company.isEnabled]}`}>{ENABLED_LABELS[company.isEnabled]}</span>
                            ) : null}
                            <span className="company_plan_badge"><Gift size={14} />Plan {planUsage?.planName || '-'}</span>
                            {isPrimary &&
                                <span className='company_plan_badge'>Empresa Primaria </span>
                            }
                        </div>
                        <span className="company_hero_subtitle">RUC {company.document}</span>
                    </div>
                </div>
                <div className="company_hero_actions">
                    <Button text="Configurar" size="sm" icon={Settings} color="secondary" onClick={() => { }} />
                </div>
            </div>

            <div className="card company_info_card">
                <div className="company_info_column">
                    <div className="title_card">
                        <Building2 size={22} />
                        <h3>Información de la empresa</h3>
                        <Button text="Editar" size="sm" icon={Pencil} onClick={openEditCompany} />
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Teléfono celular</span>
                        <span>{formatPhone(company.country?.phoneCode, company.phoneCell) || '—'}</span>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Teléfono fijo</span>
                        <span>{company.phone ? formatPhone(company.country?.phoneCode, company.phone) : '—'}</span>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Dirección</span>
                        <span>{company.address}</span>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">País</span>
                        {company.country ? (
                            <div className="company_detail_country" title={company.ubigeo?.formatted ? `${company.country.name} - ${company.ubigeo.formatted}` : company.country.name}>
                                <img src={company.country.flagUrl} alt="" />
                                <span className="ellipsis">
                                    {company.country.name}{company.ubigeo?.formatted ? ` - ${company.ubigeo.formatted}` : ''}
                                </span>
                            </div>
                        ) : '—'}
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Registrada</span>
                        <span>{formatDate(company.createdAt)}</span>
                    </div>
                </div>

                <div className="company_info_column">
                    <div className="title_card">
                        <User size={22} />
                        <h3>Información del dueño</h3>
                        {company.owner && canEditOwner && <Button text="Editar" size="sm" icon={Pencil} onClick={openEditOwner} />}
                    </div>
                    {company.owner ? (
                        <>
                            <div className="company_detail_row">
                                <span className="company_detail_label">Nombre</span>
                                <span>{`${company.owner.firstName} ${company.owner.lastName}`}</span>
                            </div>
                            <div className="company_detail_row">
                                <span className="company_detail_label">Correo</span>
                                <span>{company.owner.email ?? '—'}</span>
                            </div>
                            <div className="company_detail_row">
                                <span className="company_detail_label">Teléfono</span>
                                <span>{formatPhone(company.owner.country?.phoneCode, company.owner.phone) || '—'}</span>
                            </div>
                            <div className="company_detail_row">
                                <span className="company_detail_label">Documento</span>
                                <span>
                                    {company.owner.documentType
                                        ? `${DOCUMENT_TYPE_LABELS[company.owner.documentType]} · ${company.owner.documentNumber}`
                                        : '—'}
                                </span>
                            </div>
                            <div className="company_detail_row">
                                <span className="company_detail_label">País</span>
                                {company.owner.country ? (
                                    <div className="company_detail_country">
                                        <img src={company.owner.country.flagUrl} alt={company.owner.country.name} />
                                        <span>{company.owner.country.name}</span>
                                    </div>
                                ) : '—'}
                            </div>
                        </>
                    ) : (
                        <span className="company_empty_value">Sin dueño asignado</span>
                    )}
                </div>
            </div>

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
                                    <span>{formatPhone(company.country?.phoneCode, user.phone) || '—'}</span>
                                </div>
                                <div className="user_sucursales">
                                    {user.sucursales.map((sucursal) => (
                                        <span className="sucursal_pill" key={sucursal.publicId}>
                                            <Store size={18} />{sucursal.name ?? '—'}
                                        </span>
                                    ))}
                                </div>
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

            {canEditOwner && (
                <Modal isOpen={isEditOwnerOpen} onClose={closeEditOwner} title="Editar dueño" icon={UserCog} size="lg">
                    {isLoadingOwnerDetail || !ownerEditValues ? (
                        <LoadingScreen message="Cargando datos del dueño..." size="sm" />
                    ) : (
                        <form onSubmit={handleSubmitOwnerEdit}>
                            <FormUserManage role="super_admin" mode="edit" values={ownerEditValues} onChange={setOwnerEditField} />
                            <FormActions>
                                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={closeEditOwner} />
                                <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSavingOwner} disabled={!isOwnerEditValid} />
                            </FormActions>
                        </form>
                    )}
                </Modal>
            )}

            {canManageCompanyUsers && isUserModalOpen && (
                <UserAsingSucursal
                    onClose={closeUserModal}
                    subsidiaries={company.subsidiaries}
                    onSaved={retry}
                />
            )}
        </div>
    );
};

export default Company;
