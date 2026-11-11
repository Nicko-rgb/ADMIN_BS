import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Segmento del breadcrumb. Sin `path` se pinta como texto actual. */
export interface HeaderBreadcrumb {
    label: string;
    path?: string;
}

/** Configuración visual del header global. */
export interface HeaderConfig {
    visible?: boolean;
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    breadcrumbs?: HeaderBreadcrumb[];
    /** Oculta la fila del título cuando la página tiene su propio hero. */
    showCard?: boolean;
    /** JSX libre para insertar controles personalizados en el encabezado. */
    extra?: ReactNode;
    showNotification?: boolean;
    onNotificationClick?: () => void;
}
