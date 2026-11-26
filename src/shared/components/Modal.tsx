import { useEffect, useId, useState } from 'react';
import type { AnimationEvent, ComponentType, ReactNode } from 'react';
import { PanelTop, X } from 'lucide-react';
import '../styles/Modal.css';

type ModalIcon = ComponentType<{ size?: number; className?: string }>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    /** Bloquea los cierres del modal (X y Escape) durante una operación. */
    isLoading?: boolean;
    /** Icono del encabezado. Usa PanelTop si no se proporciona. */
    icon?: ModalIcon;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Overlay + panel modal genérico con animación de entrada/salida: sigue montado hasta
 * que termina la salida, cierra con Escape y bloquea el scroll del body mientras se ve.
 */
export const Modal = ({ isOpen, onClose, title, description, isLoading = false, icon: Icon = PanelTop, children, size = 'md' }: ModalProps) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const titleId = useId();
    const descriptionId = useId();

    if (isOpen && !isRendered) setIsRendered(true);

    const isClosing = isRendered && !isOpen;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !e.defaultPrevented && !isLoading) onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    useEffect(() => {
        if (!isRendered) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isRendered]);

    // Desmonta al terminar la animación de salida del overlay (ignora las de los hijos)
    const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
        if (isClosing && e.target === e.currentTarget) setIsRendered(false);
    };

    if (!isRendered) return null;

    return (
        <div className={`modal_overlay ${isClosing ? 'is_closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
            <div
                className={`modal_container modal_${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                aria-busy={isLoading}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="modal_header">
                    <div className="modal_heading">
                        <h2 className="modal_title" id={titleId}><span className="modal_icon center" aria-hidden="true"><Icon size={22} /></span>{title}</h2>
                        {description && <p className="modal_description" id={descriptionId}>{description}</p>}
                    </div>
                    <button
                        type="button"
                        className="modal_close_btn"
                        onClick={() => { if (!isLoading) onClose(); }}
                        disabled={isLoading}
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </header>
                <div className="modal_body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
