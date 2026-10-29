import { Fragment, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Inbox, RotateCw, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import '../styles/ScreenMessage.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LoadingJSON from '../../assets/animations/loading2.json'
import EmptyBox from '../../assets/animations/empty_box.json';


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
export const LoadingScreen = ({ message = 'Cargando...', size = 'md' }: LoadingScreenProps) => {
    let letterIndex = 0;

    return (
        <div className={`screen_message loading_screen ${size}`}>
            <DotLottieReact
                data={LoadingJSON}
                autoplay
                loop
                className='lottie_file'
            />
            <p className='wave_text' aria-label={message}>
                {message.split(' ').map((word, wordIndex, words) => (
                    <Fragment key={`${wordIndex}-${word}`}>
                        <span className='word' aria-hidden='true'>
                            {Array.from(word).map((letter) => {
                                const position = letterIndex++;

                                return (
                                    <span
                                        key={position}
                                        className='letter'
                                        style={{ animationDelay: `${position * 0.08}s` }}
                                    >
                                        {letter}
                                    </span>
                                );
                            })}
                        </span>
                        {wordIndex < words.length - 1 && ' '}
                    </Fragment>
                ))}
            </p>
        </div>
    );
};

interface ScreenMessageActions {
    /** Texto del botón "Volver". */
    backText?: string;
    /** Handler del botón "Volver" — por defecto, retrocede en el historial. */
    onBack?: () => void;
    /** Si se pasa, agrega un botón "Reintentar" que ejecuta esta función. */
    onRetry?: () => void;
}

interface NotFoundScreenProps extends ScreenMessageActions {
    /** Mensaje puntual del recurso que no existe, ej. "La empresa que buscás no existe." */
    message?: string;
}

/**
 * Recurso inexistente dentro de una página ya autenticada
 */
export const NotFoundScreen = ({
    message = 'El recurso no fue encontrado.',
    backText = 'Volver',
    onBack,
    onRetry,
}: NotFoundScreenProps) => {
    const navigate = useNavigate();

    return (
        <div className="screen_message not_found_screen ">
            <DotLottieReact
                data={EmptyBox}
                autoplay
                loop
                className='lottie_file'
            />
            <p>{message}</p>
            <div className={`actions ${onRetry ? 'dos_actions' : 'un_actions'}`}>
                {onRetry && <Button text="Reintentar" icon={RotateCw} color="secondary" onClick={onRetry} />}
                <Button text={backText} icon={ArrowLeft} onClick={onBack ?? (() => navigate(-1))} />
            </div>
        </div>
    );
};

interface EmptyScreenProps {
    /** Detalle opcional, ej. cómo crear el primer registro. */
    message?: string;
    /** Ícono — por defecto una bandeja vacía. */
    icon?: ComponentType<{ size?: number; className?: string }>;
    /** Escala — `md` para una sección de página, `sm` para un slot chico. */
    size?: ScreenMessageSize;
    /** Si se pasa junto a onAction, agrega un botón de acción (ej. "Nuevo rol"). */
    actionText?: string;
    onAction?: () => void;
    iconBtn?: ComponentType<{ size?: number; className?: string }>;
}

/**
 * Lista/tabla/grid sin registros — estado vacío dentro de una página ya
 * cargada. No confundir con `NotFoundScreen` (recurso inexistente, con botón
 * Volver) — acá el usuario está donde debe estar, solo que aún no hay datos.
 */
export const EmptyScreen = ({
    message = 'Sin registros disponibles',
    icon: Icon = Inbox,
    size = 'md',
    actionText,
    onAction,
    iconBtn
}: EmptyScreenProps) => (
    <div className={`screen_message empty_screen ${size}`}>
        <Icon className="icon" size={ size === 'sm' ? 22 : size === 'md' ? 27 : 33} />
        <p>{message}</p>
        {actionText && onAction && (
            <div className="actions">
                <Button icon={iconBtn ?? iconBtn} text={actionText} size='sm' color="secondary" onClick={onAction} />
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
        <div className="screen_message forbidden_screen">
            <ShieldAlert size={50} className="icon danger" />
            <h2>{title}</h2>
            <p>{message}</p>
            <div className={`actions ${onRetry ? 'dos_actions' : 'un_actions'}`}>
                {onRetry && <Button text="Reintentar" icon={RotateCw} color="secondary" onClick={onRetry} />}
                <Button text={backText} icon={ArrowLeft} onClick={onBack ?? (() => navigate(-1))} />
            </div>
        </div>
    );
};
