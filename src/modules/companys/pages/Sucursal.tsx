import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Pencil, Settings, ArrowLeft, Phone, MapPin, Globe, FileText, CalendarDays } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import SucursalForm from '../components/SucursalForm';
import useSucursal from '../hooks/useSucursal';
import '../styles/Sucursal.css';

const STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

// Detalle de una sucursal — portada con imagen placeholder (la foto real llegará con el
// modelo de media), nombre, estado y acciones superpuestas (VOLVER / EDITAR / CONFIGURAR),
// más cards de contacto y ubicación con los datos del DTO. Nada de dueño ni plan: eso es
// de la página de Empresa. El fetch y los estados viven en useSucursal.
const Sucursal = () => {
    const navigate = useNavigate();
    const { publicId, sucursal, isLoading, errorStatus, errorMessage, retry } = useSucursal();

    const can = usePermission();
    if (!can('sucursal.view')) {
        return <ForbiddenScreen />;
    }

    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isLoading) {
        return <LoadingScreen message="Cargando sucursal..." size="lg" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'La sucursal que buscás no existe.'} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage || 'No tenés acceso a esta sucursal.'} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen title="Ocurrió un error" message={errorMessage} onRetry={retry} />;
    }

    if (!sucursal) {
        return null;
    }

    const goBack = () => navigate(sucursal.companyPublicId ? `/companys/company/${sucursal.companyPublicId}` : '/companys');

    return (
        <div className="sucursal_page">
            <section className='sucursal_hero'>
                <div className="cover">
                    <div className="cover_placeholder" aria-hidden />
                    <div className="cover_overlay" />
                    <div className="cover_content">
                        <div className="cover_identity">
                            <div className="cover_avatar center"><Store size={30} /></div>
                            <div className="cover_text">
                                <h1>{sucursal.name}</h1>
                                {sucursal.status ? (
                                    <span className={`status_badge ${STATUS_CLASSNAMES[sucursal.status]}`}>{STATUS_LABELS[sucursal.status]}</span>
                                ) : null}
                            </div>
                        </div>
                        <div className=" cover_actions">
                            <Button text="Volver" size="sm" icon={ArrowLeft} iconPosition="left" color="secondary" onClick={goBack} />
                            {can('sucursal.edit') && (
                                <Button text="Editar" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)} />
                            )}
                            {can('sucursal.config') && (
                                <Button text="Configurar" size="sm" icon={Settings} color="secondary" title="Próximamente" onClick={() => { }} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="info_grid">
                    <div className="card  info_card">
                        <div className="title_card">
                            <Phone size={22} />
                            <h3>Contacto</h3>
                        </div>
                        <div className="detail_row">
                            <span className=" detail_label">Teléfono celular</span>
                            <span>{formatPhone(sucursal.country?.phoneCode, sucursal.phoneCell) || '—'}</span>
                        </div>
                        <div className="detail_row">
                            <span className=" detail_label">Teléfono fijo</span>
                            <span>{sucursal.phone ? formatPhone(sucursal.country?.phoneCode, sucursal.phone) : '—'}</span>
                        </div>
                        <div className="detail_row">
                            <span className=" detail_label">Sitio web</span>
                            {sucursal.website ? (
                                <a href={sucursal.website} target="_blank" rel="noreferrer">{sucursal.website}</a>
                            ) : '—'}
                        </div>
                    </div>

                    <div className="card info_card">
                        <div className="title_card">
                            <MapPin size={22} />
                            <h3>Ubicación</h3>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Dirección</span>
                            <span>{sucursal.address}</span>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">País</span>
                            {sucursal.country ? (
                                <div className="detail_country">
                                    <img src={sucursal.country.flagUrl} alt="" />
                                    <span className="ellipsis">
                                        {sucursal.country.name}{sucursal.ubigeo?.formatted ? ` - ${sucursal.ubigeo.formatted}` : ''}
                                    </span>
                                </div>
                            ) : '—'}
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Coordenadas</span>
                            <span>{sucursal.latitude && sucursal.longitude ? `${sucursal.latitude}, ${sucursal.longitude}` : '—'}</span>
                        </div>
                    </div>

                    <div className="card info_card">
                        <div className="title_card">
                            <FileText size={22} />
                            <h3>Información</h3>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Descripción</span>
                            <span>{sucursal.description || '—'}</span>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Registrada</span>
                            <span><CalendarDays size={14} /> {formatDate(sucursal.createdAt)}</span>
                        </div>
                    </div>

                    <div className="card info_card">
                        <div className="title_card">
                            <Globe size={22} />
                            <h3>Distrito</h3>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Ubigeo</span>
                            <span>{sucursal.ubigeo?.formatted || '—'}</span>
                        </div>
                    </div>
                </div>
            </section>

            {isEditOpen && sucursal.companyPublicId && (
                <SucursalForm
                    onClose={() => setIsEditOpen(false)}
                    companyPublicId={sucursal.companyPublicId}
                    sucursalPublicId={publicId ?? null}
                    onSaved={retry}
                />
            )}
        </div>
    );
};

export default Sucursal;
