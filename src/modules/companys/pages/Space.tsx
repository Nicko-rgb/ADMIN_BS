import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Clock, Dumbbell, Calendar, Grid, FileText, MapPin, ImagePlus, Pencil, Trash2, Play, Users, Info, Box, Settings, } from 'lucide-react';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen, Button, EmptyScreen, Dialog } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import { Tabs, MedibleImage } from '../../../shared/components';
import SpaceForm from '../components/SpaceForm';
import StatusSwitch from '../components/StatusSwitch';
import BusinessHour from '../components/BussinesHour';
import SpaceService from '../service/spaceService';
import useSpace from '../hooks/useSpace';
import type { SpaceTab, SpaceMediaFile, InfoChipProps, GroupChipsProps } from '../interfaces/space.interface';
import '../styles/Space.css';

const InfoChip = ({ icon: Icon, value, className }: InfoChipProps) => {
    return (
        <span className={`info_chip ${className}`}>
            {Icon && <Icon size={14} />}
            <span>{value || '—'}</span>
        </span>
    )
}

const GroupChips = ({ icon: Icon, title, children }: GroupChipsProps) => {
    return (
        <div className="overview_group">
            <label className="group_label">{Icon && <Icon size={18} />}{title}</label>
            <div className="chips_row">
                {children}
            </div>
        </div>
    )
}

const Space = () => {
    const navigate = useNavigate();
    const { spacePublicId, space, media, businessHours, isLoading, mLoading, hLoading, errorStatus, errorMessage,
        retry, reloadMedia, reloadHours, activeTab, handleTabChange, isPanelModalOpen, openPanelModal, closePanelModal,
        mediaToDelete, setMediaToDelete, isDeleting, handleDeleteMedia, isTogglingStatus, handleToggleStatus,
    } = useSpace();

    const [isEditOpen, setIsEditOpen] = useState(false);
    // Archivo de la galería abierto en el visor (modo lectura).
    const [mediaToView, setMediaToView] = useState<SpaceMediaFile | null>(null);

    if (isLoading) {
        return <LoadingScreen message="Cargando espacio..." />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen onRetry={retry} message={errorMessage || 'El espacio deportivo que buscás no existe.'} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen onRetry={retry} message={errorMessage || 'No tenés acceso a este espacio.'} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen message={errorMessage} onRetry={retry} />;
    }

    if (!space || !spacePublicId) {
        return <NotFoundScreen message="No se pudo encontrar información de este espacio" />;
    }

    const goBack = () => navigate(-1);

    const groupedHours = businessHours.reduce((groups, hour) => {
        if (!groups[hour.dayOfWeek]) {
            groups[hour.dayOfWeek] = [];
        }

        groups[hour.dayOfWeek].push(hour);
        return groups;
    }, {} as Record<string, typeof businessHours>);

    return (
        <div className="space_page">
            <main>
                {/* ── Hero del Espacio ────────────────────────────────────────────── */}
                <section className="space_hero">
                    <button className="btn_back bg_blur" onClick={goBack} aria-label="Volver"><ArrowLeft size={24} /></button>

                    <div className="cover_placeholder" aria-hidden />
                    <div className="cover_overlay" />
                    <div className="cover_identity">
                        <div className="cover_avatar center bg_blur">{space.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h1 className="cover_text">{space.name}</h1>
                            <StatusSwitch
                                value={space.status}
                                onChange={handleToggleStatus}
                                disabled={isTogglingStatus}
                            />
                        </div>
                    </div>
                    <div className="cover_actions">
                        <Button text="Editar" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)} />
                    </div>
                </section>

                {/* ── Tarjeta de información en chips ────────────────────────── */}
                <section className="card space_details_card">
                    <aside className="row">
                        <GroupChips icon={Dumbbell} title='Tipo de Espacio'>
                            <InfoChip icon={Dumbbell} value={space.sport} className='highlight' />
                            <InfoChip icon={FileText} value={space.categoryName} />
                            <InfoChip icon={Grid} value={space.surfaceName} />
                        </GroupChips>

                        <GroupChips icon={Calendar} title='Reglas de Reserva'>
                            <InfoChip icon={Clock} value={`Min: ${space.minimumBookingMinutes} min`} />
                            <InfoChip icon={Clock} value={`Max: ${space.maximumBookingMinutes} min`} />
                        </GroupChips>
                    </aside>

                    <aside className="row">
                        <GroupChips icon={Box} title='Capacidad y Dimensiones'>
                            <InfoChip icon={Users} value={`${space.capacity} personal`} className='highlight' />
                            <InfoChip icon={MapPin} value={space.dimensions} />
                            <InfoChip icon={FileText} value={space.equipment} />
                        </GroupChips>
                        <GroupChips icon={Info} title='Información'>
                            <InfoChip icon={Calendar} value={`Creado el ${formatDate(space.createdAt)}`} />
                        </GroupChips>
                    </aside>
                </section>

                <div>
                    <Tabs
                        tabs={[
                            { label: 'Galería', key: 'gallery', icon: Image },
                            { label: 'Horarios', key: 'schedule', icon: Clock },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => handleTabChange(key as SpaceTab)}
                    />

                    {/* ── Sección de Galería Multimedia ────────────────────────────────── */}
                    {activeTab === 'gallery' && (
                        <section className="section_tab_view card anim_content_in">
                            <div className="tab_section_header">
                                <div className="title_group">
                                    <Image size={20} />
                                    <h3>Galería Multimedia</h3>
                                </div>
                                <Button text='Añadir' icon={ImagePlus} color='secondary' onClick={openPanelModal} />
                            </div>
                            {!mLoading ? (
                                media.length > 0 ? (
                                    <div className="media_grid">
                                        {media.map((file) => (
                                            <figure className="media_item" key={file.publicId}>
                                                <button className="media_item_preview" onClick={() => setMediaToView(file)}>
                                                    {file.type === 'VIDEO' ? (
                                                        <>
                                                            <Play className='play_icon bg_blur' size={40} />
                                                            <video src={resolveImageUrl(file.url)} onClick={() => setMediaToView(file)} />
                                                        </>
                                                    ) : (
                                                        <img src={resolveImageUrl(file.url)} alt={file.description || file.fileName} />
                                                    )}
                                                </button>
                                                <button className="media_item_delete" onClick={() => setMediaToDelete(file)} ><Trash2 size={16} /></button>
                                                <figcaption>{file.description || file.fileName}</figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyScreen icon={Image} message='Agregá fotos o videos del espacio' size='sm' />
                                )
                            ) : (
                                <LoadingScreen message='Cargando galería...' size='sm' />
                            )}


                        </section>
                    )}

                    {/* ── Sección de Horarios de Operación ─────────────────────────────── */}
                    {activeTab === 'schedule' && (
                        <section className="section_tab_view schedules card anim_content_in">
                            <div className="tab_section_header">
                                <div className="title_group">
                                    <Clock size={20} />
                                    <h3>Horarios de Operación</h3>
                                </div>
                                <Button text='Configurar' icon={Settings} color='secondary' onClick={openPanelModal} />
                            </div>
                            {!hLoading ? (
                                businessHours.length > 0 ? (
                                    <div className="schedule_box">
                                        <table className="schedule_table">
                                            <thead>
                                                <tr>
                                                    <th>Día</th>
                                                    <th>Horario</th>
                                                    <th>Precio</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {Object.entries(groupedHours).map(([day, hours]) =>
                                                    hours.map((hour, index) => (
                                                        <tr key={hour.hourId}>
                                                             {index === 0 && (
                                                                <td className="schedule_day" rowSpan={hours.length}>{day}</td>
                                                            )}
                                                            <td><span className="schedule_time">{hour.startTime} – {hour.endTime}</span></td>
                                                            <td><span className="schedule_price">S/ {Number(hour.price).toFixed(2)}</span></td>
                                                            <td><span className={`schedule_status ${hour.isClosed ? 'closed' : 'open'}`}>{hour.isClosed ? 'Cerrado' : 'Abierto'}</span></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyScreen message='No hay ningun horario rgistrado' size='sm' />
                                )
                            ) : (
                                <LoadingScreen message='Cargando horarios...' size='sm' />
                            )}
                        </section>
                    )}
                </div>
            </main>

            {/* ── Galería del espacio — UN componente cubre vista y registro:
                con `media` es visor (con eliminar); sin `media`, registro ── */}
            <MedibleImage
                isOpen={mediaToView !== null || (isPanelModalOpen && activeTab === 'gallery')}
                onClose={mediaToView ? () => setMediaToView(null) : closePanelModal}
                title='Galería del espacio'
                icon={Image}
                accept="media"
                showDescription
                media={mediaToView}
                save={!mediaToView ? SpaceService.uploadMedia(spacePublicId) : undefined}
                remove={SpaceService.removeMedia(spacePublicId)}
                onChanged={() => {
                    reloadMedia();
                    if (mediaToView) setMediaToView(null);
                    else closePanelModal();
                }}
            />

            {/* ── Confirmación de borrado de un archivo de la galería ───────────────── */}
            <Dialog
                isOpen={mediaToDelete !== null}
                onClose={() => setMediaToDelete(null)}
                title="Eliminar archivo"
                description={`¿Seguro que querés eliminar "${mediaToDelete?.description || mediaToDelete?.fileName}" de la galería? Esta acción no se puede deshacer.`}
                variant="danger"
                primaryAction={{
                    label: isDeleting ? 'Eliminando...' : 'Eliminar',
                    onClick: handleDeleteMedia,
                    icon: Trash2,
                }}
                secondaryAction={{ label: 'Cancelar', onClick: () => setMediaToDelete(null) }}
            />

            {/* ── Modal Editar Espacio ───────────────────────────────────────── */}
            {isEditOpen && (
                <SpaceForm
                    mode="edit"
                    sucursalPublicId={spacePublicId}
                    spacePublicId={spacePublicId}
                    space={space}
                    onClose={() => setIsEditOpen(false)}
                    onSaved={retry}
                />
            )}

            {/* ── Horarios y Precio del Espacio ───────────────────────────────────────── */}
            <BusinessHour
                isOpen={isPanelModalOpen && activeTab === 'schedule'}
                onClose={closePanelModal}
                spacePublicId={spacePublicId}
                businessHours={businessHours}
                onSaved={reloadHours}
            />
        </div>
    );
};

export default Space;