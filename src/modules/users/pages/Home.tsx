import { useSessionStore } from '../../../shared/store/sessionStore';
import '../styles/Home.css';

// Página de bienvenida — vista de inicio del panel admin tras el login.
export const Home = () => {
    const user = useSessionStore((state) => state.user);

    return (
        <div className="home_page">
            <h1>¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
            <p>Vista global de tu cuenta.</p>
        </div>
    );
};

export default Home;
