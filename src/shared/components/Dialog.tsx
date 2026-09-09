import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import '../styles/Dialog.css';

type DialogVariant = 'primary' | 'warning' | 'alert';

interface DialogAction {
    label: string;
    onClick: () => void;
}

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    variant?: DialogVariant;
    primaryAction: DialogAction;
    secondaryAction?: DialogAction;
}

type DialogIcon = ComponentType<{ size?: number; className?: string }>;

const VARIANT_ICON: Record<DialogVariant, DialogIcon> = {
    primary: Info,
    warning: AlertTriangle,
    alert: AlertCircle,
};

const VARIANT_BUTTON_COLOR: Record<DialogVariant, 'primary' | 'danger' | `#${string}`> = {
    primary: 'primary',
    warning: '#ffc107',
    alert: 'danger',
};

/** Diálogo de confirmación genérico: ícono/color según variant, descripción y hasta dos botones de acción en el pie. */
export const Dialog = ({ isOpen, onClose, title, description, variant = 'primary', primaryAction, secondaryAction }: DialogProps) => {
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

    if (!isOpen) return null;

    const Icon = VARIANT_ICON[variant];

    return (
        <div className="dialog_overlay" onClick={onClose}>
            <div className={`dialog_container dialog_${variant}`} onClick={(e) => e.stopPropagation()}>
                <header className="dialog_header">
                    <h2 className="dialog_title">
                        <span className="dialog_icon">
                            <Icon size={20} />
                        </span>
                        {title}
                    </h2>
                    <button className="dialog_close_btn" onClick={onClose} aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </header>

                {description && (
                    <div className="dialog_body">
                        <p className="dialog_description">{description}</p>
                    </div>
                )}

                <footer className="dialog_footer">
                    {secondaryAction && (
                        <Button text={secondaryAction.label} color="secondary" onClick={secondaryAction.onClick} />
                    )}
                    <Button text={primaryAction.label} color={VARIANT_BUTTON_COLOR[variant]} onClick={primaryAction.onClick} />
                </footer>
            </div>
        </div>
    );
};

export default Dialog;
