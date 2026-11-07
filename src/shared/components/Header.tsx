import { Bell, ChevronRight, House } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeaderStore } from '../store/headerStore';
import '../styles/Header.css';

const Header = () => {
    const config = useHeaderStore((state) => state.config);

    if (config.visible === false) return null;

    const Icon = config.icon;

    return (
        <header className={`page_header ${!config.showCard ? 'no_card' : ''}`}>
            {(config.breadcrumbs || config.showNotification) && (
                <div className="header_top">
                    {config.breadcrumbs && (
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <Link to="/" className="breadcrumb_home" aria-label="Inicio">
                                <House size={15} strokeWidth={1.8} />
                            </Link>
                            {config.breadcrumbs.map((crumb, index) => (
                                <span className="breadcrumb_segment" key={`${crumb.label}-${index}`}>
                                    <ChevronRight size={16} strokeWidth={1.6} />
                                    {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : (
                                        <span className="breadcrumb_current" aria-current="page">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    <div className='btn_icons'>
                        {!config.showCard && config.extra && (
                            config.extra
                        )}
                        {config.showNotification && (
                            <button
                                type="button"
                                className="btn_notification"
                                title="Notificaciones"
                                aria-label="Notificaciones"
                                onClick={config.onNotificationClick}
                            >
                                <Bell size={16} strokeWidth={2.2} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {config.showCard &&
                <div className="header_main">
                    <div className="page_header_identity">
                        {Icon && <div className="header_icon center"><Icon size={25} strokeWidth={1.8} /></div>}
                        <div className="header_info">
                            {config.title && <h1>{config.title}</h1>}
                            {config.subtitle && <p>{config.subtitle}</p>}
                        </div>
                    </div>

                    {config.extra && <div className="extras">{config.extra}</div>}
                </div>
            }
        </header>
    );
};

export { Header };
export default Header;
