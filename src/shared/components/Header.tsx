import { Fragment } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import '../styles/Header.css';

interface HeaderAction {
    label: string;
    onClick: () => void;
}

// Un nivel intermedio del breadcrumb, entre "Home" y el título actual (ej. { label: 'Empresas', path: '/companys' }).
interface BreadcrumbItem {
    label: string;
    path: string;
}

interface HeaderProps {
    title: string;
    subtitle?: string;
    icon?: ComponentType<{ size?: number }>;
    action?: HeaderAction;
    // Niveles entre "Home" y el título — sin esto, el breadcrumb queda como antes (Home > título).
    breadcrumbs?: BreadcrumbItem[];
}

// Encabezado de página — breadcrumb (Home > ...breadcrumbs > título) + card con ícono/título/subtítulo y un botón de acción opcional (ej. "Nuevo Plan").
export const Header = ({ title, subtitle, icon: Icon, action, breadcrumbs = [] }: HeaderProps) => (
    <div className="page_header">
        <nav className="breadcrumb" aria-label="breadcrumb">
            <Link to="/home">Home</Link>
            {breadcrumbs.map((crumb) => (
                <Fragment key={crumb.path}>
                    <span className="breadcrumb_separator">{'>'}</span>
                    <Link to={crumb.path}>{crumb.label}</Link>
                </Fragment>
            ))}
            <span className="breadcrumb_separator">{'>'}</span>
            <span className="breadcrumb_current">{title}</span>
        </nav>

        <div className="page_header_card card">
            <div className="page_header_info">
                {Icon && (
                    <div className="page_header_icon">
                        <Icon size={26} />
                    </div>
                )}
                <div className="page_header_text">
                    <h1>{title}</h1>
                    {subtitle && <p>{subtitle}</p>}
                </div>
            </div>

            {action && <Button text={action.label} icon={Plus} onClick={action.onClick} />}
        </div>
    </div>
);

export default Header;
