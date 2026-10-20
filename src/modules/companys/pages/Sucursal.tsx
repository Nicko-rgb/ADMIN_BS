import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import {
    Store, Pencil, Settings, Phone, MapPin, FileText,
    CalendarDays, BriefcaseBusiness, Clock, Dumbbell, Plus,
    Image, ArrowLeft, Globe, Sparkles, ExternalLink,
} from 'lucide-react';
import { MedibleImage } from '../../../shared/components/MedibleImage';
import SucursalService from '../service/sucursalService';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen, PlanUsageBar, Button, Modal, EmptyScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import SucursalForm from '../components/SucursalForm';
import SucursalConfigForm from '../components/SucursalConfigForm';
import SpaceForm from '../components/SpaceForm';
import usePlanUsage from '../../../shared/hooks/usePlanUsage';
import useSucursal from '../hooks/useSucursal';
import '../styles/Sucursal.css';

const STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

// 'HH:mm:ss' de la DB → 'HH:mm' para mostrar.
const shortTime = (value: string) => value.slice(0, 5);

// Detalle de una sucursal — portada hero + tarjeta consolidada de datos en chips + recursos deportivos.
const Sucursal = () => {
    const navigate = useNavigate();
    const { publicId, sucursal, config, banner, spaces, isLoading, errorStatus, errorMessage, retry, reloadBanner, reloadSpaces } = useSucursal();
    const { planUsage, reloadPlanUsage } = usePlanUsage(sucursal?.companyPublicId ?? undefined);

    const can = usePermission();
    const canEditBanner = can('sucursal.edit');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isBannerOpen, setIsBannerOpen] = useState(false);
    const [isSpaceOpen, setIsSpaceOpen] = useState(false);

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
        return <NotFoundScreen message="No se pudo encontrar información de esta sucursal" />;
    }

    const goBack = () => navigate(`/companys/company/${sucursal.companyPublicId}`);

    // Redes con valor para el cover — brand icons vía react-icons.
    const socials = [
        config?.socialFacebook ? { href: config.socialFacebook, label: 'Facebook', key: 'facebook', Icon: FaFacebook } : null,
        config?.socialInstagram ? { href: config.socialInstagram, label: 'Instagram', key: 'instagram', Icon: FaInstagram } : null,
        config?.socialTiktok ? { href: config.socialTiktok, label: 'TikTok', key: 'tiktok', Icon: FaTiktok } : null,
        config?.socialYoutube ? { href: config.socialYoutube, label: 'YouTube', key: 'youtube', Icon: FaYoutube } : null,
        config?.socialWhatsapp ? {
            href: `https://wa.me/${config.socialWhatsapp}${config.whatsappMessage ? `?text=${encodeURIComponent(config.whatsappMessage)}` : ''}`,
            label: 'WhatsApp',
            key: 'whatsapp',
            Icon: FaWhatsapp,
        } : null,
    ].filter((s): s is { href: string; label: string; key: string; Icon: IconType } => s !== null);

    const featuresList = config?.features
        ? config.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

    return (
        <div className="sucursal_page">
            <section className="sucursal_hero">
                <div className="cover">
                    <button className="btn_back" onClick={() => navigate(-1)}><ArrowLeft /></button>
                    {canEditBanner && <button className="btn_bg_sucursal" title="Cambiar portada" onClick={() => setIsBannerOpen(true)}><Image size={16} /></button>}
                    {banner ? (
                        <img className="cover_image" src={resolveImageUrl(banner.url)} alt={`Portada de ${sucursal.name}`} />
                    ) : (
                        <div className="cover_placeholder" aria-hidden />
                    )}
                    <div className="cover_overlay" />
                    <div className="cover_content">
                        <div className="cover_identity">
                            <div className="cover_avatar center"><Store size={30} /></div>
                            <div>
                                <h1 className="cover_text">
                                    {sucursal.name}
                                    {sucursal.status && (
                                        <span className={`status_badge ${STATUS_CLASSNAMES[sucursal.status]}`}>
                                            {STATUS_LABELS[sucursal.status]}
                                        </span>
                                    )}
                                </h1>
                                <div className="cover_socials">
                                    {socials.length > 0 ? (
                                        socials.map(({ href, label, key, Icon }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={label}
                                                aria-label={label}
                                                className={`center cover_social_link ${key}`}
                                            >
                                                <Icon size={18} aria-hidden />
                                            </a>
                                        ))
                                    ) : (
                                        <span className="cover_socials_empty">Sin redes sociales</span>
                                    )}
                                </div>
                            </div>
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

                {/* ── Tarjeta de información organizada en chips ──── */}
                <div className="card sucursal_details_card">
                    {sucursal.description && (
                        <div className="sucursal_description_box">
                            <FileText size={18} />
                            <p>{sucursal.description}</p>
                        </div>
                    )}

                    <div className="overview_groups">
                        {/* Grupo: Ubicación y Contacto */}
                        <div className="overview_group">
                            <span className="group_label">
                                <MapPin size={14} /> Ubicación y Contacto
                            </span>
                            <div className="chips_row">
                                <span className="info_chip" title="Dirección">
                                    <MapPin size={14} />
                                    <span>{sucursal.address || '—'}</span>
                                </span>

                                {sucursal.country && (
                                    <span className="info_chip" title="País y Ubigeo">
                                        <img src={sucursal.country.flagUrl} alt="" className="chip_flag" />
                                        <span>
                                            {sucursal.country.name}
                                            {sucursal.ubigeo?.formatted ? ` · ${sucursal.ubigeo.formatted}` : ''}
                                        </span>
                                    </span>
                                )}

                                {sucursal.latitude && sucursal.longitude && (
                                    <a
                                        href={`https://www.google.com/maps?q=${sucursal.latitude},${sucursal.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="info_chip clickable"
                                        title="Abrir en Google Maps"
                                    >
                                        <Globe size={14} />
                                        <span>GPS: {sucursal.latitude}, {sucursal.longitude}</span>
                                        <ExternalLink size={15} />
                                    </a>
                                )}

                                <span className="info_chip" title="Teléfono celular">
                                    <Phone size={14} />
                                    <span>{formatPhone(sucursal.country?.phoneCode, sucursal.phoneCell) || '—'}</span>
                                </span>

                                {sucursal.phone && (
                                    <span className="info_chip" title="Teléfono fijo">
                                        <Phone size={14} />
                                        <span>Fijo: {sucursal.phone}</span>
                                    </span>
                                )}

                                {sucursal.website && (
                                    <a
                                        href={sucursal.website.startsWith('http') ? sucursal.website : `https://${sucursal.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="info_chip clickable"
                                        title="Visitar sitio web"
                                    >
                                        <Globe size={14} />
                                        <span>{sucursal.website}</span>
                                        <ExternalLink size={15} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Grupo: Operatividad */}
                        <div className="overview_group">
                            <span className="group_label">
                                <Clock size={14} /> Operativo
                            </span>
                            <div className="chips_row">
                                {config?.openingTime && config?.closingTime ? (
                                    <span className="info_chip highlight" title="Horario de atención">
                                        <Clock size={14} />
                                        <span>{shortTime(config.openingTime)} – {shortTime(config.closingTime)}</span>
                                    </span>
                                ) : (
                                    <span className="info_chip muted" title="Horario sin definir">
                                        <Clock size={14} />
                                        <span>Horario no definido</span>
                                    </span>
                                )}

                                {config?.minPrice ? (
                                    <span className="info_chip highlight_green" title="Precio mínimo">
                                        <span>Desde S/ {config.minPrice}</span>
                                    </span>
                                ) : null}

                                <span className="info_chip" title="Fecha de registro">
                                    <CalendarDays size={14} />
                                    <span>Registrada el {formatDate(sucursal.createdAt)}</span>
                                </span>

                                {!config && (
                                    <div className="config_unconfigured">
                                        <span className="config_empty_hint">Sin configuración operativa</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grupo: Características */}
                        {featuresList.length > 0 && (
                            <div className="overview_group">
                                <span className="group_label">
                                    <Sparkles size={14} /> Características
                                </span>
                                <div className="chips_row">
                                    {featuresList.map((feature, idx) => (
                                        <span className="info_chip feature_chip" key={idx}>
                                            <Sparkles size={14} />
                                            <span>{feature}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Mis recursos deportivos ─────────────────────────── */}
            <section className="list_spaces card">
                <div className="title_card">
                    <Dumbbell />
                    <h3>Mis recursos deportivos</h3>
                    <PlanUsageBar value={planUsage?.spaces} label="Espacios" />
                    <Button text="Nuevo Espacio" icon={Plus} onClick={() => setIsSpaceOpen(true)} />
                </div>
                {spaces.length > 0 ? (
                    <div className="spaces_grid">
                        {spaces.map((space) => (
                            <article className="space_card card" key={space.publicId}>
                                <div className="header">
                                    <div className="avatar center">{space.name.charAt(0).toUpperCase()}</div>
                                    <div className='header_text'>
                                        <span className="name">{space.name}</span>
                                        <span className={`status_badge ${STATUS_CLASSNAMES[space.status]}`}>{STATUS_LABELS[space.status]}</span>
                                    </div>
                                </div>
                                <div className="info">
                                    <p><Dumbbell size={20} /><span>{space.sport}</span></p>
                                </div>
                                <Button text='Administrar' color='secondary' icon={Settings} onClick={() => navigate(`/companys/company/space/${space.publicId}`)} />
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyScreen icon={Dumbbell} message="Todavía no tiene espacios" title="" size='sm' />
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

            {isBannerOpen && publicId && (
                <Modal isOpen={isBannerOpen} onClose={() => setIsBannerOpen(false)} title="Portada de la sucursal" icon={Image} size="lg">
                    <MedibleImage
                        mode="read_delete"
                        onChanged={() => {
                            reloadBanner();
                            // Al registrar (o eliminar) la portada, el modal se cierra.
                            setIsBannerOpen(false);
                        }}
                        mediaSelect={banner}
                        api={{
                            // Sin permiso no se inyectan los métodos de escritura →
                            // no hay controles de subir/borrar.
                            ...(canEditBanner && {
                                uploadImage: (file: File, description?: string) =>
                                    SucursalService.uploadBanner(publicId, file, description),
                                removeImage: () => SucursalService.removeBanner(publicId),
                            }),
                        }}
                    />
                </Modal>
            )}

            {isSpaceOpen && publicId && (
                <SpaceForm
                    mode="create"
                    sucursalPublicId={publicId}
                    onClose={() => setIsSpaceOpen(false)}
                    onSaved={() => { reloadSpaces(); reloadPlanUsage(); }}
                />
            )}
        </div>
    );
};

export default Sucursal;
