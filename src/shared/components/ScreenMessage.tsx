import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, SearchX, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import '../styles/ScreenMessage.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LoadingJSON from '../../assets/animations/loading2.json'
type ScreenMessageSize = 'sm' | 'md' | 'lg';

interface LoadingScreenProps {
    /** Texto bajo el spinner. */
    message?: string;
    /** Escala el spinner y el texto — `sm` para un slot chico (modal, card), `lg` para página completa. */
    size?: ScreenMessageSize;
}

/**
 * Spinner centrado que llena el ancho/alto disponible del contenedor donde se
 * monte (necesita que el padre tenga alto propio, ej. `height: 100%` o un
 * flex item). Reemplaza los "Cargando..." sueltos repetidos en cada página.
 */
export const LoadingScreen = ({ message = 'Cargando...', size = 'md' }: LoadingScreenProps) => (
    <div className={`screen_message screen_message_${size}`}>
        <DotLottieReact
            data={LoadingJSON}
            autoplay
            loop
            className='lottie_file'
        />
        {message && <p>{message}</p>}
    </div>
);

interface ScreenMessageActions {
    /** Texto del botón "Volver". */
    backText?: string;
    /** Handler del botón "Volver" — por defecto, retrocede en el historial. */
    onBack?: () => void;
    /** Si se pasa, agrega un botón "Reintentar" que ejecuta esta función. */
    onRetry?: () => void;
}

interface NotFoundScreenProps extends ScreenMessageActions {
    title?: string;
    /** Mensaje puntual del recurso que no existe, ej. "La empresa que buscás no existe." */
    message?: string;
}

/**
 * Recurso inexistente dentro de una página ya autenticada — ej. navegar a
 * `/companys/company/:publicId` con un publicId que no matchea ninguna
 * empresa. No confundir con `NotFoundPage` (esa es la 404 de ruta, ruta que
 * ni siquiera matchea en el router)
 */
export const NotFoundScreen = ({
    title = 'No encontrado',
    message = 'El recurso que buscás no existe o fue eliminado.',
    backText = 'Volver',
    onBack,
    onRetry,
}: NotFoundScreenProps) => {
    const navigate = useNavigate();

    return (
        <div className="screen_message screen_message_lg">
            <SearchX className="screen_message_icon" />
            <h2>{title}</h2>
            <p>{message}</p>
            <div className="screen_message_actions">
                {onRetry && <Button text="Reintentar" color="secondary" onClick={onRetry} />}
                <Button text={backText} onClick={onBack ?? (() => navigate(-1))} />
            </div>
        </div>
    );
};

interface EmptyScreenProps {
    /** Título del estado, ej. "No hay roles registrados". */
    title?: string;
    /** Detalle opcional, ej. cómo crear el primer registro. */
    message?: string;
    /** Ícono — por defecto una bandeja vacía. */
    icon?: ComponentType<{ size?: number; className?: string }>;
    /** Escala — `md` para una sección de página, `sm` para un slot chico. */
    size?: ScreenMessageSize;
    /** Si se pasa junto a onAction, agrega un botón de acción (ej. "Nuevo rol"). */
    actionText?: string;
    onAction?: () => void;
}

/**
 * Lista/tabla/grid sin registros — estado vacío dentro de una página ya
 * cargada. No confundir con `NotFoundScreen` (recurso inexistente, con botón
 * Volver) — acá el usuario está donde debe estar, solo que aún no hay datos.
 */
export const EmptyScreen = ({
    title = 'Sin registros',
    message,
    icon: Icon = Inbox,
    size = 'md',
    actionText,
    onAction,
}: EmptyScreenProps) => (
    <div className={`screen_message screen_message_${size}`}>
        <Icon className="screen_message_icon" />
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {actionText && onAction && (
            <div className="screen_message_actions">
                <Button text={actionText} color="secondary" onClick={onAction} />
            </div>
        )}
    </div>
);

interface ForbiddenScreenProps extends ScreenMessageActions {
    title?: string;
    message?: string;
}

/**
 * Página cuyo permiso requerido no lo tiene el usuario autenticado — ej. el
 * registro de empresa exige `company.create` (ver usePermission)
 */
export const ForbiddenScreen = ({
    title = 'Acceso denegado',
    message = 'No tenés acceso/permisos para ver esta página.',
    backText = 'Volver',
    onBack,
    onRetry,
}: ForbiddenScreenProps) => {
    const navigate = useNavigate();

    return (
        <div className="screen_message screen_message_lg">
            <ShieldAlert className="screen_message_icon screen_message_icon_danger" />
            <h2>{title}</h2>
            <p>{message}</p>
            <div className="screen_message_actions">
                {onRetry && <Button text="Reintentar" color="secondary" onClick={onRetry} />}
                <Button text={backText} onClick={onBack ?? (() => navigate(-1))} />
            </div>
        </div>
    );
};
