import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Image, ImagePlus, Trash2, UploadCloud, X } from 'lucide-react';
import { EmptyScreen, Button } from './';
import { TextAreaField, FormActions } from './';
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
    /** Tipo del archivo — si es VIDEO, el componente lo muestra como <video>. */
    type?: MediaFileType;
}

/**
 * Modos del componente:
 * - `register`     — REGISTRAR: siempre vacío, solo permite subir. Tras subir vuelve
 *                    a vacío (queda listo para el siguiente archivo).
 * - `read`         — LEER solo lectura: muestra el archivo recibido, sin acciones.
 * - `read_delete`  — LEER y BORRAR: muestra el archivo recibido y permite eliminarlo.
 *                    Si el api además trae `uploadImage`, aparece el control de
 *                    subida para reemplazarlo (ej. la portada, que se reemplaza sola).
 */
export type MedibleImageMode = 'register' | 'read' | 'read_delete';

/**
 * Operaciones que el padre inyecta — el componente no conoce módulos ni endpoints.
 * El componente NUNCA carga: si el archivo ya existe, se lo pasa en `mediaSelect`.
 *
 * La presencia de un método es la habilitación de su acción: si el padre no lo
 * inyecta, el control no existe. El permiso lo aplica el padre y el backend —
 * este componente no sabe de roles ni permisos.
 */
export interface MedibleImageApi {
    /** Sube el archivo — devuelve el registro creado y el mensaje del backend. */
    uploadImage?: (file: File, description?: string) => Promise<{ data: MedibleImageFile; message: string }>;
    /** Elimina el archivo — devuelve el mensaje del backend. */
    removeImage?: () => Promise<{ message: string }>;
}

interface MedibleImageProps {
    /** Mododo de uso — 'register' | 'read' | 'read_delete' */
    mode: MedibleImageMode;
    showDescription?: boolean;
    accept?: 'image' | 'media';
    onChanged?: () => void;
    /** Archivo a mostrar — el padre lo carga y lo pasa; el componente no hace fetch. */
    mediaSelect?: MedibleImageFile | null;
    /** Operaciones de escritura que el padre habilita. */
    api?: MedibleImageApi | null;
}

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

/** Tipos que acepta el input de archivo. */
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp';
const ACCEPTED_MEDIA = `${ACCEPTED_IMAGES},video/mp4,video/webm,video/quicktime`;

/** ¿La url apunta a un video? — fallback cuando el archivo no trae `type`. */
const isVideoUrl = (url: string): boolean => /\.(mp4|webm|mov|m4v)$/i.test(url);

/**
 * Archivo multimedia de una entidad — el padre inyecta el api del módulo dueño.
 * Tres modos: registrar (siempre vacío), leer (solo lectura) y leer+borrar.
 */
export const MedibleImage = ({ mode, showDescription = false, accept = 'image', onChanged, mediaSelect, api }: MedibleImageProps) => {
    // El permiso NO es del componente: si el padre no inyecta el método, la acción
    // no existe. El api es el único mecanismo de habilitación (además lo valida
    // el backend).
    const canUpload = Boolean(api?.uploadImage);
    const canRemove = mode === 'read_delete' && Boolean(api?.removeImage);
    const allowsVideo = accept === 'media';
    const acceptedTypes = allowsVideo ? ACCEPTED_MEDIA : ACCEPTED_IMAGES;

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // El archivo mostrado — siempre viene del padre.
    const currentImage = mediaSelect ?? null;

    // Vista previa del archivo pendiente — se libera al cambiar o guardar.
    useEffect(() => {
        if (!pendingFile) {
            setPendingPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(pendingFile);
        setPendingPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [pendingFile]);

    const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPendingFile(file);
        e.target.value = '';
    };

    const handleSave = async () => {
        if (!pendingFile || !api?.uploadImage) return;
        setIsSaving(true);
        try {
            const result = await api.uploadImage(pendingFile, showDescription ? description : undefined);
            // Tras subir queda listo para el siguiente archivo; en los modos de
            // lectura, el padre refresca `mediaSelect` con `onChanged`.
            setPendingFile(null);
            setDescription('');
            toast.success(result.message);
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!currentImage || !api?.removeImage) return;
        setIsSaving(true);
        try {
            const result = await api.removeImage();
            toast.success(result.message);
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const previewUrl = pendingPreview ?? (currentImage ? resolveImageUrl(currentImage.url) : null);
    // El pendiente se detecta por su MIME; el ya guardado, por su `type` o la extensión.
    const isVideo = pendingFile
        ? pendingFile.type.startsWith('video/')
        : Boolean(currentImage && (currentImage.type === 'VIDEO' || isVideoUrl(currentImage.url)));
    const shownName = pendingFile?.name ?? currentImage?.fileName ?? null;
    // El peso solo se conoce del archivo pendiente (la BD no guarda tamaño).
    const shownSize = pendingFile ? formatBytes(pendingFile.size) : null;

    return (
        <div className="medible_image">
            {previewUrl ? (
                isVideo ? (
                    <video className="medible_image_image" src={previewUrl} controls preload="metadata" />
                ) : (
                    <img className="medible_image_image" src={previewUrl} alt={shownName || 'Imagen'} />
                )
            ) : (
                <EmptyScreen title={allowsVideo ? 'Sin archivo' : 'Sin imagen'} message='Sin recurso' icon={Image} />
            )}

            {shownName && (
                <div className="medible_image_meta">
                    <span className="medible_image_filename">{shownName}</span>
                    {shownSize && <span className="medible_image_filesize">{shownSize}</span>}
                </div>
            )}

            {showDescription && !pendingFile && currentImage?.description && (
                <p className="medible_image_description">{currentImage.description}</p>
            )}

            {(canUpload || canRemove) && (
                <>
                    {canUpload && (
                        <>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={acceptedTypes}
                                className="medible_image_input"
                                onChange={pickFile}
                            />
                            {showDescription && pendingFile && (
                                <TextAreaField
                                    name="image_description"
                                    label="Descripción"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descripción de la imagen (opcional)"
                                />
                            )}
                        </>
                    )}
                    <FormActions>
                        {canUpload && (
                            <>
                                <Button text={currentImage || pendingFile ? 'Cambiar' : 'Subir'} icon={ImagePlus} size="md" color="secondary" type="button" onClick={() => inputRef.current?.click()} />
                                {pendingFile && (
                                    <>
                                        <Button text="Cancelar" icon={X} size="md" color="secondary" type="button" onClick={() => setPendingFile(null)} />
                                        <Button text="Guardar" icon={UploadCloud} size="md" type="button" onClick={handleSave} loading={isSaving} />
                                    </>
                                )}
                            </>
                        )}
                        {/* Sin archivo no hay nada que eliminar. */}
                        {canRemove && currentImage && !pendingFile && (
                            <Button text="Eliminar" icon={Trash2} size="md" color="danger" type="button" onClick={handleRemove} loading={isSaving} />
                        )}
                    </FormActions>
                </>
            )}
        </div>
    );
};

export default MedibleImage;
