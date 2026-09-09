import { NavLink, Outlet } from 'react-router-dom';
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, ShieldUser, UserCircle } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { useSessionStore } from '../store/sessionStore';
import { useAppLayout } from '../hooks/useAppLayout';
import { resolveMenuIcon } from '../utils/menuTree';
// import { Link } from 'react-router-dom';
import '../styles/AppLayout.css';

// Shell del panel admin: sidebar con el menú del usuario (agrupado, con submenús) + área de contenido con las rutas hijas.
export const AppLayout = () => {
    const { groups, isLoading, expandedKeys, toggleExpanded } = useMenu();
    const user = useSessionStore((state) => state.user);
    const { isCollapsed, toggleSidebar, isDark, toggleTheme, logout } = useAppLayout();

    // Sin usuario (sesión recién limpiada, ej. token expirado) — no hay nada que mostrar, ProtectedRoute ya está redirigiendo.
    if (!user) return null;

    return (
        <div className={`app_layout ${isCollapsed ? 'collapsed' : ''}`}>
            <section className="sidebar">
                <div className="sidebar_header">
                    <div className="brand">
                        <div className="brand_icon">
                            <ShieldUser size={24} />
                        </div>
                        <div className="brand_text">
                            <h2>APP ADMIN</h2>
                            <span>{user.role.replace('_', ' ').toUpperCase()}</span>
                        </div>
                    </div>
                    <button type="button" className="collapse_toggle" onClick={toggleSidebar}>
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>

                <nav className="menu_list">
                    {isLoading ? <div className="menu_placeholder">Cargando...</div> : (
                        groups.map((group) => (
                            <div key={group.title} className="menu_group">
                                {!isCollapsed && (
                                    <span className="group_title">{group.title}</span>
                                )}

                                {group.items.map((item) => {
                                    const Icon = resolveMenuIcon(item.icon);
                                    const hasChildren = item.children.length > 0;
                                    const isExpanded = expandedKeys.has(item.key);

                                    if (hasChildren) {
                                        return (
                                            <div key={item.key} className="menu_parent">
                                                <button
                                                    type="button"
                                                    className={`menu_item ${isExpanded ? 'expanded' : ''}`}
                                                    onClick={() => toggleExpanded(item.key)}
                                                >
                                                    {Icon && <Icon size={18} />}
                                                    <span className="menu_item_label">{item.label}</span>
                                                    <ChevronDown size={14} className="menu_chevron" />
                                                </button>

                                                {isExpanded && (
                                                    <div className="menu_submenu">
                                                        {item.children.map((child) => {
                                                            const ChildIcon = resolveMenuIcon(child.icon);
                                                            return (
                                                                <NavLink
                                                                    key={child.key}
                                                                    to={child.path ?? '#'}
                                                                    className={({ isActive }) => `menu_item submenu_item ${isActive ? 'active' : ''}`}
                                                                >
                                                                    {ChildIcon && <ChildIcon size={16} />}
                                                                    <span className="menu_item_label">{child.label}</span>
                                                                </NavLink>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={item.key}
                                            to={item.path ?? '#'}
                                            className={({ isActive }) => `menu_item ${isActive ? 'active' : ''}`}
                                        >
                                            {Icon && <Icon size={16} />}
                                            <span className="menu_item_label">{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </nav>

                <div className="sidebar_footer">
                    <NavLink to="/home/profile" className="menu_item">
                        <UserCircle size={16} />
                        <span className="menu_item_label">Mi Perfil</span>
                    </NavLink>

                    <div className="dark_mode_row">
                        <span className="menu_item_label">Dark Mode</span>
                        <button
                            type="button"
                            className={`theme_switch ${isDark ? 'on' : ''}`}
                            onClick={toggleTheme}
                            aria-label="Cambiar tema"
                        >
                            <span className="theme_switch_thumb" />
                        </button>
                    </div>

                    <button type="button" className="logout_btn" onClick={logout}>
                        <LogOut size={16} />
                        <span className="menu_item_label">Cerrar Sesión</span>
                    </button>
                </div>
            </section>
            <section className="app_section">
                {/* ── Breadcrum e icono ──────────────────────────────────── */}
                {/* <header className='app_header'>
                    <Link>Home</Link> <ChevronRight /> <Link>Ruta 1</Link> <ChevronRight /> <Link>Ruta 2</Link>
                </header> */}
                <main className='app_main'>
                    <Outlet />
                </main>
            </section>
        </div>
    );
};

export default AppLayout;
