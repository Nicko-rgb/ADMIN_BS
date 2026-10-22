import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ComponentType } from 'react';
import { Image, ImagePlus, Scan, Trash2, UploadCloud, X } from 'lucide-react';
import { EmptyScreen, Button, TextAreaField, FormActions, Modal } from './';
import { handleApiError } from '../utils/errorHandler';
import { resolveImageUrl } from '../utils/formatText';
import toast from '../utils/toast';
import '../styles/MedibleImage.css';

/** Tipos de archivo multimedia — espeja MEDIA_TYPES del backend (system/interfaces/media.interface.ts). */
export type MediaFileType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface MedibleImageFile {
    publicId: string;
    url: string;
    fileName: string;
    description: string | null;
    type?: MediaFileType;
}
export type MedibleImageAccept = 'image' | 'media';

interface MedibleImageProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
    size?: 'sm' | 'md' | 'lg';
    showDescription?: boolean;
    accept?: MedibleImageAccept;
    media?: MedibleImageFile | null;
    save?: (file: File, description?: string) => Promise<{ message: string }>;
    remove?: (mediaPublicId: string) => Promise<{ message: string }>;
    onChanged?: () => void;
}

/** MIME types que acepta el input de archivo, por preset. */
const ACCEPTED_TYPES: Record<MedibleImageAccept, string> = {
    image: 'image/jpeg,image/png,image/webp',
    media: 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime',
};
/** ¿La url apunta a un video? — fallback cuando el archivo no trae `type`. */
const isVideoUrl = (url: string): boolean => /\.(mp4|webm|mov|m4v)$/i.test(url);

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

/**
 * Visor + gestor de un archivo multimedia (imagen o video) — se muestra dentro
 * de un Modal.
 */
export const MedibleImage = ({
    isOpen,
    onClose,
    title = 'Archivo',
    icon = Image,
    size = 'lg',
    showDescription = false,
    accept = 'image',
    media = null,
    save,
    remove,
    onChanged,
}: MedibleImageProps) => {
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    const canSave = Boolean(save);
    const canRemove = Boolean(remove);

    // Libera la vista previa del archivo pendiente al desmontar el componente.
    useEffect(() => () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    }, []);

    /** Reemplaza el archivo pendiente y regenera su vista previa. */
    const setPending = (file: File | null) => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = file ? URL.createObjectURL(file) : null;
        setPendingFile(file);
        setPendingPreview(previewUrlRef.current);
        setDescription('');
    };

    const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
        setPending(e.target.files?.[0] ?? null);
        e.target.value = '';
    };

    const handleSave = async () => {
        if (!pendingFile || !save) return;
        setIsSaving(true);
        try {
            const { message } = await save(pendingFile, showDescription ? description : undefined);
            setPending(null);
            toast.success(message);
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!remove || !media) return;
        setIsSaving(true);
        try {
            // El componente sabe qué archivo está en pantalla → le pasa su publicId.
            const { message } = await remove(media.publicId);
            toast.success(message);
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    // El archivo en pantalla — el pendiente tiene prioridad sobre el ya guardado.
    const previewUrl = pendingPreview ?? (media ? resolveImageUrl(media.url) : null);
    const isVideo = pendingFile
        ? pendingFile.type.startsWith('video/')
        : Boolean(media && (media.type === 'VIDEO' || isVideoUrl(media.url)));

    const shownName = pendingFile?.name ?? media?.fileName ?? null;
    const shownSize = pendingFile ? formatBytes(pendingFile.size) : null;
    const pickText = media || pendingFile ? 'Cambiar' : 'Registrar';

    const closeFullScreen = () => {
        setIsImageFullscreen(false)
        onClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={title} icon={icon} size={size}>
                <div className="medible_image">
                    {canSave && (
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPTED_TYPES[accept]}
                            className="medible_image_input"
                            onChange={pickFile}
                        />
                    )}

                    {previewUrl ? (
                        <div className="box_media">
                            {isVideo ? (
                                <video className="medible_image_image" src={previewUrl} controls />
                            ) : (
                                <>
                                    <img className="medible_image_image" src={previewUrl} alt={shownName || 'Imagen'} />
                                    <Scan className="icon_full_screen bg_blur" onClick={() => setIsImageFullscreen(true)} size={25} />
                                </>
                            )}
                        </div>
                    ) : (
                        <EmptyScreen
                            title={accept === 'media' ? 'Sin archivo' : 'Sin imagen'}
                            message="Sin recurso"
                            icon={Image}
                        />
                    )}

                    {shownName && (
                        <div className="medible_image_meta">
                            <span className="medible_image_filename">{shownName}</span>
                            {shownSize && <span className="medible_image_filesize">{shownSize}</span>}
                        </div>
                    )}

                    {showDescription && pendingFile && (
                        <TextAreaField
                            name='media_description'
                            label='Descripción'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Descripción de la imagen (opcional)'
                            maxLength={500}
                            rows={3}
                        />
                    )}

                    {showDescription && !pendingFile && media?.description && (
                        <p className="medible_image_description">{media.description}</p>
                    )}

                    {(canSave || canRemove) && (
                        <FormActions>
                            {canRemove && media && !pendingFile && (
                                <Button text='Eliminar' icon={Trash2} size='md' color='danger' type='button' onClick={handleRemove} loading={isSaving} />
                            )}

                            {canSave && (
                                <>
                                    <Button text={pickText} icon={ImagePlus} size='md' color='secondary' type='button' onClick={() => inputRef.current?.click()} />
                                    {pendingFile && (
                                        <Button text='Guardar' icon={UploadCloud} size='md' type='button' onClick={handleSave} loading={isSaving} />
                                    )}
                                </>
                            )}
                        </FormActions>
                    )}
                </div>
            </Modal>
            {isImageFullscreen && previewUrl && (
                <div className="medible_image_fullscreen">
                    <X size={50} onClick={closeFullScreen} className="medible_image_fullscreen_close" />

                    <img
                        src={previewUrl}
                        alt={shownName || 'Imagen ampliada'}
                        className="medible_image_fullscreen_img"
                    />
                </div>
            )}
        </>
    );
};

export default MedibleImage;
