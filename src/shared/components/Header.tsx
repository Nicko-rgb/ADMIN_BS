import { Bell, BookOpen, ChevronRight, House, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeaderStore } from '../store/headerStore';
import { useSessionStore } from '../store/sessionStore';

import '../styles/Header.css';

const Header = () => {
    const config = useHeaderStore((state) => state.config);
    const user = useSessionStore((state) => state.user);

    if (config.visible === false) return null;

    const Icon = config.icon;
    const userName = user?.firstName || 'Mi cuenta';

    return (
        <header className={`page_header ${!config.showCard ? 'no_card' : ''}`}>
            {(config.breadcrumbs || config.showNotification) && (
                <div className="header_top">
                    {config.breadcrumbs && (
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <Link to="/" className="breadcrumb_home" aria-label="Inicio">
                                <House size={15} strokeWidth={1.8} aria-hidden="true" />
                            </Link>
                            {config.breadcrumbs.map((crumb, index) => (
                                <span className="breadcrumb_segment" key={`${crumb.label}-${index}`}>
                                    <ChevronRight size={15} strokeWidth={1.6} aria-hidden="true" />
                                    {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : (
                                        <span className="breadcrumb_current" aria-current="page">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    <div className='btn_icons'>
                        <button
                            className="icon_button context_app"
                            data-tooltip="Documentación y pruebas"
                            onClick={() => window.location.href = '/context-app'}
                        >
                            <BookOpen size={17} strokeWidth={1.9} />
                        </button>

                        {config.showNotification && (
                            <button
                                className="icon_button btn_notification"
                                data-tooltip="Notificaciones"
                                onClick={config.onNotificationClick}
                            >
                                <Bell size={17} strokeWidth={2} />
                            </button>
                        )}

                        {user && (
                            <Link to="/profile" className="user_chip" aria-label={`Mi perfil: ${userName}`}>
                                <span className="user_avatar"><User size={15} strokeWidth={2} /></span>
                                <span className="user_name">{userName}</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {config.showCard &&
                <div className="header_main">
                    <div className="page_header_identity">
                        {Icon && <div className="header_icon center"><Icon size={21} strokeWidth={1.9} /></div>}
                        <div className="header_info">
                            {config.title && <h1>{config.title}</h1>}
                            {config.subtitle && <p>{config.subtitle}</p>}
                        </div>
                    </div>

                    {config.extra && (config.extra)}
                </div>
            }
        </header>
    );
};

export { Header };
export default Header;
