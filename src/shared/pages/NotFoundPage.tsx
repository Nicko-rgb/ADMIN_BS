import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import '../styles/NotFoundPage.css';

// Página 404 — se muestra cuando un usuario autenticado navega a una ruta que no existe.
export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="not_found_page">
            <h1>404</h1>
            <p>La página que buscás no existe.</p>
            <Button text="Volver a inicio" onClick={() => navigate('/home')} />
        </div>
    );
};

export default NotFoundPage;
