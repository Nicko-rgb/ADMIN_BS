import { useEffect } from 'react';
import type { ComponentType, ReactNode } from 'react';
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

/** Cierra el modal con Escape y bloquea el scroll del body mientras está abierto. */
const useModal = (isOpen: boolean, onClose: () => void) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);
};

/** Overlay + panel modal genérico: header con ícono/título/botón cerrar y cuerpo libre para el contenido. */
export const Modal = ({ isOpen, onClose, title, icon: Icon, children, size = 'md' }: ModalProps) => {
    useModal(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className="modal_overlay" onClick={onClose}>
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
