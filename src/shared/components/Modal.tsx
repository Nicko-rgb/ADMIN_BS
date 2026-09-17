import { useEffect, useState } from 'react';
import type { AnimationEvent, ComponentType, ReactNode } from 'react';
import { X } from 'lucide-react';
import '../styles/Modal.css';

type ModalIcon = ComponentType<{ size?: number; className?: string }>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: ModalIcon;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Overlay + panel modal genérico con animación de entrada/salida: sigue montado hasta
 * que termina la salida, cierra con Escape y bloquea el scroll del body mientras se ve.
 */
export const Modal = ({ isOpen, onClose, title, icon: Icon, children, size = 'md' }: ModalProps) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    if (isOpen && !isRendered) setIsRendered(true);

    const isClosing = isRendered && !isOpen;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isRendered) return;

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isRendered]);

    // Desmonta al terminar la animación de salida del overlay (ignora las de los hijos)
    const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
        if (isClosing && e.target === e.currentTarget) setIsRendered(false);
    };

    if (!isRendered) return null;

    return (
        <div className={`modal_overlay ${isClosing ? 'is_closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
            <div className={`modal_container modal_${size}`} onClick={(e) => e.stopPropagation()}>
                <header className="modal_header">
                    <h2 className="modal_title">
                        {Icon && <Icon size={20} />}
                        {title}
                    </h2>
                    <button className="modal_close_btn" onClick={onClose} aria-label="Cerrar modal">
                        <X size={18} strokeWidth={4} />
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
