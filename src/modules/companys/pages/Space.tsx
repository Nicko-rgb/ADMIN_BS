import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Clock, Dumbbell, Calendar, Grid, FileText, MapPin, ImagePlus, Pencil, ClockPlus, Trash2, } from 'lucide-react';
import { LoadingScreen, NotFoundScreen, ForbiddenScreen, Button, EmptyScreen, Modal, Dialog } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import { Tabs, MedibleImage } from '../../../shared/components';
import SpaceForm from '../components/SpaceForm';
import StatusSwitch from '../components/StatusSwitch';
import SpaceService from '../service/spaceService';
import useSpace from '../hooks/useSpace';
import type { SpaceTab, SpaceMediaFile } from '../interfaces/space.interface';
import '../styles/Space.css';

const Space = () => {
    const navigate = useNavigate();
    const {
        spacePublicId,
        space,
        media,
        businessHours,
        isLoading,
        errorStatus,
        errorMessage,
        retry,
        reloadMedia,
        activeTab,
        handleTabChange,
        isPanelModalOpen,
        openPanelModal,
        closePanelModal,
        mediaToDelete,
        setMediaToDelete,
        isDeleting,
        handleDeleteMedia,
        isTogglingStatus,
        handleToggleStatus,
    } = useSpace();

    const [isEditOpen, setIsEditOpen] = useState(false);
    // Archivo de la galería abierto en el visor (modo lectura).
    const [mediaToView, setMediaToView] = useState<SpaceMediaFile | null>(null);

    if (isLoading) {
        return <LoadingScreen message="Cargando espacio deportivo..." size="lg" />;
    }

    if (errorStatus === 'not_found') {
        return <NotFoundScreen message={errorMessage || 'El espacio deportivo que buscás no existe.'} />;
    }

    if (errorStatus === 'forbidden') {
        return <ForbiddenScreen message={errorMessage || 'No tenés acceso a este espacio.'} />;
    }

    if (errorStatus === 'unknown') {
        return <NotFoundScreen title="Ocurrió un error" message={errorMessage} onRetry={retry} />;
    }

    if (!space) {
        return <NotFoundScreen message="No se pudo encontrar información de este espacio" />;
    }

    const goBack = () => navigate(-1);

    return (
        <div className="space_page">
            <main>
                {/* ── Hero del Espacio ────────────────────────────────────────────── */}
                <section className="space_hero">
                    <button className="btn_back" onClick={goBack} aria-label="Volver"><ArrowLeft size={24} /></button>

                    <div className="cover_placeholder" aria-hidden />
                    <div className="cover_overlay" />
                    <div className="cover_content">
                        <div className="cover_identity">
                            <div className="cover_avatar center">{space.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <h1 className="cover_text">{space.name}</h1>
                                <StatusSwitch
                                    value={space.status}
                                    onChange={handleToggleStatus}
                                    disabled={isTogglingStatus}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cover_actions">
                        <Button text="Editar" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)} />
                    </div>
                </section>

                {/* ── Tarjeta de información en chips ────────────────────────── */}
                <section className="card space_details_card">
                    <aside className="row">
                        {/* Grupo: Tipo de Espacio */}
                        <div className="overview_group">
                            <label className="group_label"><Dumbbell size={18} /> Tipo de Espacio</label>
                            <div className="chips_row">
                                <span className="info_chip highlight" title="Deporte">
                                    <Dumbbell size={14} />
                                    <span>{space.sport || '—'}</span>
                                </span>
                                <span className="info_chip" title="Categoría">
                                    <FileText size={14} />
                                    <span>{space.categoryName || '—'}</span>
                                </span>
                                <span className="info_chip" title="Superficie">
                                    <Grid size={14} />
                                    <span>{space.surfaceName || '—'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Grupo: Reglas de Reserva */}
                        <div className="overview_group">
                            <label className="group_label"><Clock size={18} /> Reglas de Reserva</label>
                            <div className="chips_row">
                                <span className="info_chip" title="Reserva mínima">
                                    <Clock size={14} />
                                    <span>Mín: {space.minimumBookingMinutes} min</span>
                                </span>
                                <span className="info_chip" title="Reserva máxima">
                                    <Clock size={14} />
                                    <span>Máx: {space.maximumBookingMinutes} min</span>
                                </span>
                            </div>
                        </div>
                    </aside>

                    <aside className="row">
                        {/* Grupo: Capacidad y Dimensiones */}
                        <div className="overview_group">
                            <label className="group_label"><Calendar size={18} /> Capacidad y Dimensiones</label>
                            <div className="chips_row">
                                {space.capacity && (
                                    <span className="info_chip highlight" title="Capacidad máxima">
                                        <span>👥</span>
                                        <span>{space.capacity} personas</span>
                                    </span>
                                )}
                                <span className="info_chip" title="Dimensiones">
                                    <MapPin size={14} />
                                    <span>{space.dimensions || '—'}</span>
                                </span>
                                {space.equipment && (
                                    <span className="info_chip" title="Equipamiento">
                                        <FileText size={14} />
                                        <span>{space.equipment}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Grupo: Fechas */}
                        <div className="overview_group">
                            <label className="group_label"><FileText size={18} /> Información</label>
                            <div className="chips_row">
                                <span className="info_chip" title="Fecha de creación">
                                    <Calendar size={14} />
                                    <span>Creado el {formatDate(space.createdAt)}</span>
                                </span>
                            </div>
                        </div>
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

                            {media.length > 0 ? (
                                <div className="media_grid">
                                    {media.map((file) => (
                                        <figure className="media_item" key={file.publicId}>
                                            {file.type === 'VIDEO' ? (
                                                // El video se reproduce inline — su click no abre el visor.
                                                <video
                                                    src={resolveImageUrl(file.url)}
                                                    controls
                                                    preload="metadata"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="media_item_preview"
                                                    onClick={() => setMediaToView(file)}
                                                    aria-label={`Ver ${file.description || file.fileName}`}
                                                >
                                                    <img src={resolveImageUrl(file.url)} alt={file.description || file.fileName} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="media_item_delete"
                                                onClick={() => setMediaToDelete(file)}
                                                aria-label={`Eliminar ${file.fileName}`}
                                                title="Eliminar archivo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <figcaption>{file.description || file.fileName}</figcaption>
                                        </figure>
                                    ))}
                                </div>
                            ) : (
                                <EmptyScreen icon={Image} title='Sin archivos multimedia' message='Agregá fotos o videos del espacio' size='sm' />
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
                                <Button text='Añadir' icon={ClockPlus} color='secondary' onClick={openPanelModal} />
                            </div>

                            {businessHours.length > 0 ? (
                                <ul className="schedule_list">
                                    {businessHours.map((hour) => (
                                        <li key={hour.hourId}>{hour.dayOfWeek}: {hour.startTime} – {hour.endTime}</li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyScreen icon={Clock} title='Sin horarios configurados' message='Los horarios de operación se gestionan desde la configuración de la sucursal' size='sm' />
                            )}
                        </section>
                    )}
                </div>
            </main>

            {/* ── Visor de un archivo de la galería ─────────────────────────────────── */}
            <MedibleImage
                isOpen={mediaToView !== null}
                onClose={() => setMediaToView(null)}
                title={mediaToView?.description || mediaToView?.fileName || 'Archivo'}
                icon={Image}
                accept="media"
                showDescription
                media={mediaToView}
                remove={spacePublicId ? SpaceService.removeMedia(spacePublicId) : undefined}
                onChanged={() => { reloadMedia(); setMediaToView(null); }}
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

            {/* ── Modales de sección — UN solo estado de apertura (isPanelModalOpen);
                   cuál se muestra lo decide la pestaña activa (activeTab). ───────── */}
            <MedibleImage
                isOpen={isPanelModalOpen && activeTab === 'gallery'}
                onClose={closePanelModal}
                title="Galería del espacio"
                icon={Image}
                showDescription
                accept="media"
                save={spacePublicId ? SpaceService.uploadMedia(spacePublicId) : undefined}
                onChanged={() => { reloadMedia(); closePanelModal(); }}
            />

            {/* TODO: modal de horarios — falta el componente de gestión de
                BusinessHour (backend sin endpoint todavía). */}
            <Modal
                isOpen={isPanelModalOpen && activeTab === 'schedule'}
                onClose={closePanelModal}
                title="Horarios de operación"
                icon={Clock}
                size="lg"
            >
                <EmptyScreen icon={Clock} title='Próximamente' message='La gestión de horarios por espacio todavía no está disponible' size='sm' />
            </Modal>

            {/* ── Modal Editar Espacio ───────────────────────────────────────── */}
            {isEditOpen && spacePublicId && (
                <SpaceForm
                    mode="edit"
                    sucursalPublicId={spacePublicId}
                    spacePublicId={spacePublicId}
                    space={space}
                    onClose={() => setIsEditOpen(false)}
                    onSaved={retry}
                />
            )}
        </div>
    );
};

export default Space;