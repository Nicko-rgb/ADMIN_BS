import { useNavigate } from 'react-router-dom';
import { SearchX, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import '../styles/ScreenMessage.css';

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
        <span className="screen_message_spinner" />
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
    message = 'No tenés acceso para ver esta página.',
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
