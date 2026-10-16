import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Image, ImagePlus, Trash2, UploadCloud, X } from 'lucide-react';
import { LoadingScreen, EmptyScreen, Button } from './';
import { TextAreaField, FormActions } from './';
import { handleApiError } from '../utils/errorHandler';
import { resolveImageUrl } from '../utils/formatText';
import toast from '../utils/toast';
import '../styles/MedibleImage.css';

export interface MedibleImageFile {
    publicId: string;
    url: string;
    fileName: string;
    description: string | null;
}

/** Operaciones que el padre inyecta — el componente no conoce módulos ni endpoints. */
export interface MedibleImageApi {
    getImage: () => Promise<MedibleImageFile | null>;
    uploadImage: (file: File, description?: string) => Promise<MedibleImageFile>;
    removeImage: () => Promise<void>;
}

interface MedibleImageProps {
    /** Título de la card (ej. "Portada de la sucursal"). */
    title?: string;
    /** Muestra la descripción guardada y permite registrarla al subir. */
    showDescription?: boolean;
    /** Sin edición muestra solo lectura (el padre la apaga según permiso). */
    editable?: boolean;
    onChanged?: () => void;
    /** Service del módulo dueño (sucursal, espacio, usuario...) ya apuntando a su entidad. */
    api: MedibleImageApi;
}

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp';

/** Imagen única de una entidad — el padre inyecta el api del módulo dueño. */
export const MedibleImage = ({ title = 'Imagen', showDescription = false, editable = true, onChanged, api }: MedibleImageProps) => {
    const [image, setImage] = useState<MedibleImageFile | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Imagen actual al montar.
    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setPendingFile(null);
        api.getImage()
            .then((data) => {
                if (!active) return;
                setImage(data);
                setDescription(data?.description ?? '');
            })
            .catch((err) => { if (active) toast.error(handleApiError(err)); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- api estable por entidad (la crea el padre)
    }, []);

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
        if (!pendingFile) return;
        setIsSaving(true);
        try {
            const saved = await api.uploadImage(pendingFile, showDescription ? description : undefined);
            setImage(saved);
            setPendingFile(null);
            toast.success('Imagen actualizada');
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!image) return;
        setIsSaving(true);
        try {
            await api.removeImage();
            setImage(null);
            setDescription('');
            toast.success('Imagen eliminada');
            onChanged?.();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const previewUrl = pendingPreview ?? (image ? resolveImageUrl(image.url) : null);
    const shownName = pendingFile?.name ?? image?.fileName ?? null;
    // El peso solo se conoce del archivo pendiente (la BD no guarda tamaño).
    const shownSize = pendingFile ? formatBytes(pendingFile.size) : null;

    return (
        <div className="medible_image">
            <div className="medible_image_header">
                <h3>{title}</h3>
            </div>

            {isLoading ? (
                <LoadingScreen message='Cargando imagen...' />
            ) : (
                <>
                    {previewUrl ? (
                        <img className="medible_image_image" src={previewUrl} alt={title} />
                    ) : (
                        <EmptyScreen title='Sin imagen' message='Sin recurso' icon={Image}  />
                    )}

                    {shownName && (
                        <div className="medible_image_meta">
                            <span className="medible_image_filename">{shownName}</span>
                            {shownSize && <span className="medible_image_filesize">{shownSize}</span>}
                        </div>
                    )}

                    {showDescription && !pendingFile && image?.description && (
                        <p className="medible_image_description">{image.description}</p>
                    )}

                    {editable && (
                        <>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPTED_IMAGES}
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
                            <FormActions>
                                <Button text={image || pendingFile ? 'Cambiar' : 'Subir'} icon={ImagePlus} size="md" color="secondary" type="button" onClick={() => inputRef.current?.click()} />
                                {pendingFile && (
                                    <>
                                        <Button text="Cancelar" icon={X} size="md" color="secondary" type="button" onClick={() => setPendingFile(null)} />
                                        <Button text="Guardar" icon={UploadCloud} size="md" type="button" onClick={handleSave} loading={isSaving} />
                                    </>
                                )}
                                {!pendingFile && image && (
                                    <Button text="Eliminar" icon={Trash2} size="md" color="danger" type="button" onClick={handleRemove} loading={isSaving} />
                                )}
                            </FormActions>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MedibleImage;
