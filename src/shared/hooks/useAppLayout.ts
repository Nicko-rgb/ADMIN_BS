import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useThemeStore } from '../store/themeStore';

/**
 * Estado y handlers propios de AppLayout — logout, colapso del sidebar y
 * tema oscuro — unificados acá porque ningún otro componente los usa.
 */
export const useAppLayout = () => {
    const navigate = useNavigate();
    const clearSession = useSessionStore((state) => state.clearSession);
    const isDark = useThemeStore((state) => state.isDark);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Sincroniza el tema guardado con data-theme en <html> — colors.css ya define [data-theme="dark"].
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const logout = () => {
        clearSession();
        navigate('/auth/login');
    };

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return { logout, isCollapsed, toggleSidebar, isDark, toggleTheme };
};
