import { FaRegUser } from 'react-icons/fa';
import { IoArrowForwardOutline, IoLockClosedOutline } from 'react-icons/io5';
import { MdAdminPanelSettings } from 'react-icons/md';
import { Button, InputField } from '../../../shared/components';
import { useLogin } from '../hooks/useLogin';
import '../styles/LoginPage.css';

// Vista de inicio de sesión del panel admin — ruta de arranque de la app.
const LoginPage = () => {
    const { email, setEmail, password, setPassword, isSubmitting, handleSubmit } = useLogin();

    return (
        <div className="login_page">
            <section className="login_seccion">
                <div className="admin_header">
                    <MdAdminPanelSettings className="admin_icon" />
                    <h2>Admin BS</h2>
                </div>

                <div className="login_form_container">
                    <h3>Iniciar sesión</h3>

                    <form onSubmit={handleSubmit} className="login_form">
                        <InputField
                            name="email"
                            label="Usuario"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={FaRegUser}
                        />
                        <InputField
                            type="password"
                            name="password"
                            label="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={IoLockClosedOutline}
                        />

                        <Button
                            text="Iniciar sesión"
                            type="submit"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            icon={IoArrowForwardOutline}
                            iconPosition='left'
                        />
                    </form>
                </div>

                <div className="footer_text">
                    <p>Sistema de administración de Booking Sport</p>
                </div>
            </section>

            <section className="login_side" aria-hidden="true" />
        </div>
    );
};

export default LoginPage;
