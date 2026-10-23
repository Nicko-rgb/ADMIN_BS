import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import {
    Store, Pencil, Settings, Phone, MapPin, FileText,
    CalendarDays, BriefcaseBusiness, Clock, Dumbbell, Plus,
    Image, ArrowLeft, Globe, Sparkles, ExternalLink, Share2,
} from 'lucide-react';
import { MedibleImage } from '../../../shared/components/MedibleImage';
import SucursalService from '../service/sucursalService';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen, PlanUsageBar, Button, EmptyScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatPhone } from '../../../shared/utils/formatText';
import { formatDate } from '../../../shared/utils/formatDate';
import SucursalForm from '../components/SucursalForm';
import SucursalConfigForm from '../components/SucursalConfigForm';
import StatusSwitch from '../components/StatusSwitch';
import SpaceForm from '../components/SpaceForm';
import usePlanUsage from '../../../shared/hooks/usePlanUsage';
import useSucursal from '../hooks/useSucursal';
import type { InfoChipProps } from '../interfaces/sucursal.interface';
import '../styles/Sucursal.css';

const STATUS_LABELS = { ACTIVE: 'Activa', INACTIVE: 'Inactiva', MAINTENANCE: 'Mantenimiento' } as const;
const STATUS_CLASSNAMES = { ACTIVE: 'active', INACTIVE: 'inactive', MAINTENANCE: 'maintenance' } as const;

// 'HH:mm:ss' de la DB → 'HH:mm' para mostrar.
const shortTime = (value: string) => value.slice(0, 5);

const InfoChip = ({ icon: Icon, image, value, title, className, href, trailingIcon: TrailingIcon, children }: InfoChipProps) => {
    if (value == null && !image && !children) return null;

    const content = children ?? (<> {image && <img src={image} alt="" className="chip_flag" />} {Icon && <Icon size={14} />} <span>{value}</span> {TrailingIcon && <TrailingIcon size={15} />} </>);
    if (href) { return (<a href={href} target="_blank" rel="noreferrer" title={title} className={`info_chip clickable ${className ?? ''}`}>{content}</a>); }
    return (<span title={title} className={`info_chip ${className ?? ''}`}>{content}</span>);
};

// Detalle de una sucursal — portada hero + tarjeta consolidada de datos en chips + recursos deportivos.
const Sucursal = () => {
    const navigate = useNavigate();
    const { publicId, sucursal, config, banner, spaces, isLoading, errorStatus, errorMessage, retry, reloadBanner, reloadSpaces, handleToggleStatus, isTogglingStatus } = useSucursal();
    const { planUsage, reloadPlanUsage } = usePlanUsage(sucursal?.companyPublicId ?? undefined);
    const can = usePermission();
    const canEditBanner = can('sucursal.edit');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isBannerOpen, setIsBannerOpen] = useState(false);
    const [isSpaceOpen, setIsSpaceOpen] = useState(false);
    // Redes desplegadas en abanico (táctil / clic).
    const [isSocialsOpen, setIsSocialsOpen] = useState(false);
    const fanRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<number | undefined>(undefined);

    // El abanico se abre al entrar (hover/foco) y se cierra con retardo para
    // que el puntero pueda cruzar el hueco hasta una red sin cerrarlo antes.
    const openSocialsFan = () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
        setIsSocialsOpen(true);
    };

    const closeSocialsFan = () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => setIsSocialsOpen(false), 220);
    };

    // Toque fuera del abanico → se cierra (móvil).
    useEffect(() => {
        if (!isSocialsOpen) return;
        const handleOutside = (event: PointerEvent) => {
            if (!fanRef.current?.contains(event.target as Node)) setIsSocialsOpen(false);
        };
        document.addEventListener('pointerdown', handleOutside);
        return () => document.removeEventListener('pointerdown', handleOutside);
    }, [isSocialsOpen]);

    // Limpia el timer al desmontar la página.
    useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

    if (isLoading) {
        return <LoadingScreen message="Cargando sucursal..." size="md" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'No se pudo encontrar información de esta sucursal' } />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage} />;
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

    // Ángulo de cada red en el abanico — el CSS no puede calcular el seno/coseno,
    // así que el reparto angular se hace acá (círculo completo, arrancando arriba).
    const fanAngles = socials.map((_, idx) => {
        const total = socials.length;
        if (total === 1) return 0;
        return -90 + (360 / total) * idx;
    });

    return (
        <div className="sucursal_page">
            <section className="sucursal_hero">
                <div className="cover">
                    <button className="btn_back" onClick={() => navigate(-1)}><ArrowLeft /></button>
                    <div className='config_top'>
                        {canEditBanner && <button className="btn_bg_sucursal bg_blur" title="Cambiar portada" onClick={() => setIsBannerOpen(true)}><Image size={16} /></button>}
                        {can('sucursal.config') && (<button className='btn_bg_sucursal bg_blur' onClick={() => setIsConfigOpen(true)}><Settings size={16} /> </button>)}
                    </div>
                    {banner ? (
                        <img className="cover_image" src={resolveImageUrl(banner.url)} alt={`Portada de ${sucursal.name}`} />
                    ) : (
                        <div className="cover_placeholder" aria-hidden />
                    )}
                    <div className="cover_overlay" />
                    <div className="cover_identity">
                        <div className="cover_avatar center bg_blur"><Store size={30} /></div>
                        <div>
                            <h1 className="cover_text">
                                {sucursal.name}
                            </h1>
                            <StatusSwitch
                                value={sucursal.status}
                                onChange={handleToggleStatus}
                                disabled={isTogglingStatus}
                            />
                        </div>
                    </div>
                    <div className="cover_actions">
                        <div className="cover_socials">
                        {socials.length > 0 && (
                            <div
                                ref={fanRef}
                                className={`cover_socials_fan ${isSocialsOpen ? 'is_open' : ''}`}
                                onMouseEnter={openSocialsFan}
                                onMouseLeave={closeSocialsFan}
                                onFocus={openSocialsFan}
                                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSocialsFan(); }}
                            >
                                <button
                                    type="button"
                                    className="cover_socials_trigger"
                                    aria-label="Ver redes sociales"
                                    aria-expanded={isSocialsOpen}
                                    onClick={openSocialsFan}
                                >
                                    <Share2 size={18} aria-hidden />
                                </button>
                                {socials.map(({ href, label, key, Icon }, idx) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={label}
                                        aria-label={label}
                                        className={`center cover_social_link ${key}`}
                                        style={{ '--fan-angle': `${fanAngles[idx]}deg`, '--fan-delay': `${idx * 45}ms` } as CSSProperties}
                                    >
                                        <Icon size={16} aria-hidden />
                                    </a>
                                ))}
                            </div>
                        )}
                        {can('company.view') && (
                            <Button text="Mi Empresa" size="sm" icon={BriefcaseBusiness} iconPosition="left" onClick={goBack} />
                        )}
                        {can('sucursal.edit') && (
                            <Button text="Editar" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)} />
                        )}
                    </div>
                    </div>
                </div>

                {/* ── Tarjeta de información organizada en chips ──── */}
                <div className="card sucursal_details_card">
                    <div className="sucursal_description_box">
                        <FileText size={18} />
                        <p>{sucursal.description || 'Sin descripción'}</p>
                    </div>

                    <div className="overview_groups">
                        {/* Grupo: Ubicación y Contacto */}
                        <div className="overview_group">
                            <span className="group_label">
                                <MapPin size={14} /> Ubicación y Contacto
                            </span>
                            <div className="chips_row">
                                <InfoChip icon={MapPin} value={sucursal.address} />
                                <InfoChip image={sucursal.country?.flagUrl} value={[sucursal.country?.name, sucursal.ubigeo?.formatted].filter(Boolean).join(' · ')} />
                                <InfoChip
                                    icon={Globe}
                                    value={`GPS: ${sucursal.latitude}, ${sucursal.longitude}`}
                                    href={`https://www.google.com/maps?q=${sucursal.latitude},${sucursal.longitude}`}
                                    trailingIcon={ExternalLink}
                                />
                                <InfoChip icon={Phone} value={formatPhone(sucursal.country?.phoneCode, sucursal.phoneCell)} />
                                {sucursal.phone && (<InfoChip icon={Phone} value={`Fijo: ${sucursal.phone}`} />)}
                                <InfoChip icon={Globe} value={sucursal.website} href={sucursal.website} trailingIcon={ExternalLink} />
                            </div>
                        </div>

                        {/* Grupo: Operatividad */}
                        <div className="overview_group">
                            <span className="group_label">
                                <Clock size={14} /> Operativo y Redes
                            </span>
                            <div className="chips_row">
                                {config?.openingTime && config?.closingTime ? (
                                    <InfoChip
                                        icon={Clock}
                                        value={`${shortTime(config.openingTime)} – ${shortTime(config.closingTime)}`}
                                        className="highlight"
                                    />
                                ) : (<span className="config_empty_hint">Sin configuración...</span>)}
                                {config?.minPrice && (<InfoChip value={`Desde S/ ${config.minPrice}`} className="highlight_green" />)}
                                <InfoChip icon={CalendarDays} value={`Registrada el ${formatDate(sucursal.createdAt)}`} />

                                {!config && (<span className="config_empty_hint">Sin configuración...</span>)}
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
                                        <InfoChip icon={Sparkles} value={feature} className="feature_chip" key={idx} />
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
                    onSaved={retry}
                />
            )}

            <MedibleImage
                isOpen={isBannerOpen && !!publicId}
                onClose={() => setIsBannerOpen(false)}
                title="Portada de la sucursal"
                icon={Image}
                accept="image"
                media={banner}
                onChanged={() => { reloadBanner(); setIsBannerOpen(false); }}
                save={publicId ? SucursalService.uploadBanner(publicId) : undefined}
                remove={publicId ? SucursalService.removeBanner(publicId) : undefined}
            />

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
