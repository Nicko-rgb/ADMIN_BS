import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Pencil, Settings, Phone, MapPin, FileText, CalendarDays, BriefcaseBusiness, Clock, Dumbbell, Plus, Image, ArrowLeft } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen, PlanUsageBar } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import SucursalForm from '../components/SucursalForm';
import SucursalConfigForm from '../components/SucursalConfigForm';
import usePlanUsage from '../../../shared/hooks/usePlanUsage';
import useSucursal from '../hooks/useSucursal';
import '../styles/Sucursal.css';

const STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

// 'HH:mm:ss' de la DB → 'HH:mm' para mostrar.
const shortTime = (value: string) => value.slice(0, 5);

// Detalle de una sucursal — portada con imagen placeholder (la foto real llegará con el
// modelo de media), nombre, estado y acciones superpuestas (VOLVER / EDITAR / CONFIGURAR),
// más cards de contacto y ubicación con los datos del DTO. Nada de dueño ni plan: eso es
// de la página de Empresa. El fetch y los estados viven en useSucursal.
const Sucursal = () => {
    const navigate = useNavigate();
    const { publicId, sucursal, config, isLoading, errorStatus, errorMessage, retry } = useSucursal();
    const { planUsage, notificationsTier, reloadPlanUsage } = usePlanUsage(sucursal?.companyPublicId);

    const can = usePermission();
    if (!can('sucursal.view')) {
        return <ForbiddenScreen />;
    }

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

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
        return <NotFoundScreen message='No se pudo encontrar información de esta sucursal' />
    }

    const goBack = () => navigate(`/companys/company/${sucursal.companyPublicId}`);

    // Redes con valor para el cover — lucide-react v1.33 eliminó los brand icons,
    // así que van círculos con iniciales. WhatsApp abre wa.me con mensaje precargado.
    const socials = [
        config?.socialFacebook ? { href: config.socialFacebook, label: 'Facebook', short: 'Fb' } : null,
        config?.socialInstagram ? { href: config.socialInstagram, label: 'Instagram', short: 'Ig' } : null,
        config?.socialTiktok ? { href: config.socialTiktok, label: 'TikTok', short: 'Tk' } : null,
        config?.socialYoutube ? { href: config.socialYoutube, label: 'YouTube', short: 'Yt' } : null,
        config?.socialWhatsapp ? {
            href: `https://wa.me/${config.socialWhatsapp}${config.whatsappMessage ? `?text=${encodeURIComponent(config.whatsappMessage)}` : ''}`,
            label: 'WhatsApp',
            short: 'Wa',
        } : null,
    ].filter((s): s is { href: string; label: string; short: string } => s !== null);

    return (
        <div className="sucursal_page">
            <section className='sucursal_hero'>
                <div className="cover">
                    <button className='btn_back' onClick={() => navigate(-1)}><ArrowLeft /></button>
                    <button className='btn_bg_sucursal'><Image size={16}/></button>
                    <div className="cover_placeholder" aria-hidden />
                    <div className="cover_overlay" />
                    <div className="cover_content">
                        <div className="cover_identity">
                            <div className="cover_avatar center"><Store size={30} /></div>
                            <div className="cover_text">
                                <h1>{sucursal.name}</h1>
                                <span className={`status_badge ${STATUS_CLASSNAMES[sucursal.status]}`}>{STATUS_LABELS[sucursal.status]}</span>
                            </div>
                        </div>
                        <div className="cover_socials">
                            {socials.length > 0 ? (
                                socials.map(({ href, label, short }) => (
                                    <a key={label} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className="cover_social_link">
                                        {short}
                                    </a>
                                ))
                            ) : (
                                <span className="cover_socials_empty">Sin redes sociales</span>
                            )}
                        </div>
                    </div>
                    <div className="cover_actions">
                        {can('company.view') && (
                            <Button text="Mi Empresa" size="sm" icon={BriefcaseBusiness} iconPosition="left" onClick={goBack} />
                        )}
                        {can('sucursal.edit') && (
                            <Button text="Editar" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)} />
                        )}
                        {can('sucursal.config') && (
                            <Button text="Configurar" size="sm" icon={Settings} color="secondary" onClick={() => setIsConfigOpen(true)} />
                        )}
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
                            <Clock size={22} />
                            <h3>Operativo</h3>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Horario</span>
                            <span>{config?.openingTime && config?.closingTime ? `${shortTime(config.openingTime)} – ${shortTime(config.closingTime)}` : '—'}</span>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Precio mínimo</span>
                            <span>{config?.minPrice ? `S/ ${config.minPrice}` : '—'}</span>
                        </div>
                        <div className="detail_row">
                            <span className="detail_label">Características</span>
                            <span>{config?.features || '—'}</span>
                        </div>
                        {!config && (
                            <div className="detail_row">
                                <span className="config_empty_hint">Sin configurar</span>
                                {can('sucursal.config') && (
                                    <Button text="Configurar" size="xs" icon={Settings} color="secondary" onClick={() => setIsConfigOpen(true)} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className='list_spaces card'>
                <div className="title_card">
                    <Dumbbell />
                    <h3>Mis recursos deportivos</h3>
                    <PlanUsageBar value={planUsage?.spaces} label='Espacios' />
                    <Button text='Nuevo Espacio' icon={Plus} />
                </div>
                {sucursal.spaces.length > 0 ? (
                    <div className="spaces_grid">
                        {sucursal.spaces.map((space) => (
                            <div className="space_card" key={space.publicId}>
                                <div className="space_card_header">
                                    <div className="space_card_avatar center">{space.name.charAt(0).toUpperCase()}</div>
                                    <div className="space_card_title">
                                        <span className="name">{space.name}</span>
                                        <span className="sport">{space.sport ?? '—'}</span>
                                    </div>
                                    <span className={`status_badge ${STATUS_CLASSNAMES[space.status]}`}>{STATUS_LABELS[space.status]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="spaces_empty">
                        <Dumbbell size={26} />
                        <span>Todavía no tiene espacios</span>
                    </div>
                )}
            </section>

            {isEditOpen && sucursal.companyPublicId && (
                <SucursalForm
                    onClose={() => setIsEditOpen(false)}
                    companyPublicId={sucursal.companyPublicId}
                    sucursalPublicId={publicId ?? null}
                    onSaved={retry}
                />
            )}

            {isConfigOpen && publicId && (
                <SucursalConfigForm
                    onClose={() => setIsConfigOpen(false)}
                    sucursalPublicId={publicId}
                    currentStatus={sucursal.status}
                    onSaved={retry}
                />
            )}
        </div>
    );
};

export default Sucursal;
