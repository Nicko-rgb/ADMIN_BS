import { Settings, Pencil, Store, Building2, User } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { TableImage } from '../../../shared/components/Table';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import { DOCUMENT_TYPE_LABELS } from '../../users/utils/userConstants';
import useCompany from '../hooks/useCompany';
import '../styles/Company.css';

const ENABLED_LABELS = { A: 'Activo', I: 'Inactivo', P: 'Pendiente' } as const;
const ENABLED_CLASSNAMES = { A: 'active', I: 'inactive', P: 'pending' } as const;

// Detalle de una empresa — página de entidad, tipo perfil: avatar con la inicial + nombre +
// acciones centrados arriba, la info debajo, y las sucursales al final en grid (solo nombre,
// la vista de detalle de sucursal todavía no existe). El fetch vive en useCompany.
const Company = () => {
    const { company, isLoading } = useCompany();

    if (isLoading) {
        return <div className="company_detail_state">Cargando...</div>;
    }

    if (!company) {
        return null;
    }

    return (
        <div className="company_detail_page">
            <Header title={company.name} breadcrumbs={[{ label: 'Empresas', path: '/companys' }]} showCard={false} />

            <div className="company_profile">
                <div className="company_avatar">{company.name.charAt(0).toUpperCase()}</div>
                <h1>{company.name}</h1>
                {company.isEnabled && (
                    <span className={`status_badge ${ENABLED_CLASSNAMES[company.isEnabled]}`}>{ENABLED_LABELS[company.isEnabled]}</span>
                )}
                <div className="company_profile_actions">
                    <Button text="Configurar" icon={Settings} color="secondary" onClick={() => {}} />
                    <Button text="Editar datos" icon={Pencil} onClick={() => {}} />
                </div>
            </div>

            <div className="company_detail_content">
                <div className="company_info_card">
                    <div className="company_detail_card_title">
                        <Building2 size={18} />
                        <h3>Información de la empresa</h3>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Nombre completo</span>
                        <span>{company.name}</span>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Documento (RUC)</span>
                        <span>{company.document}</span>
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
                            <div className="company_detail_country">
                                <TableImage src={company.country.flagUrl} alt={company.country.name} />
                                <span>{company.country.name}</span>
                            </div>
                        ) : '—'}
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Ubigeo</span>
                        <span>{company.ubigeo?.formatted ?? '—'}</span>
                    </div>
                    <div className="company_detail_row">
                        <span className="company_detail_label">Registrada</span>
                        <span>{formatDate(company.createdAt)}</span>
                    </div>
                </div>

                <div className="company_info_card">
                    <div className="company_detail_card_title">
                        <User size={18} />
                        <h3>Información del dueño</h3>
                    </div>
                    {company.owner ? (
                        <>
                            <div className="company_detail_row">
                                <span className="company_detail_label">Nombre</span>
                                <span>{company.owner.name}</span>
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
                                        <TableImage src={company.owner.country.flagUrl} alt={company.owner.country.name} />
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

            <div className="company_subsidiaries_section">
                <div className="company_detail_card_title">
                    <Store size={18} />
                    <h3>Sucursales</h3>
                </div>
                {company.subsidiaries.length > 0 ? (
                    <div className="company_subsidiaries_grid">
                        {company.subsidiaries.map((subsidiary, index) => (
                            <div className="company_subsidiary_card" key={index}>
                                <div className="company_subsidiary_avatar">{subsidiary.name.charAt(0).toUpperCase()}</div>
                                <span>{subsidiary.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="company_empty_value">Todavía no tiene sucursales</span>
                )}
            </div>
        </div>
    );
};

export default Company;
