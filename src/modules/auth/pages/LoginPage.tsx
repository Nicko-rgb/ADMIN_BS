import { IoArrowForwardOutline, IoLockClosedOutline, IoMailOutline } from 'react-icons/io5';
import { MdAdminPanelSettings } from 'react-icons/md';
import { Button, InputField } from '../../../shared/components';
import { GradientWaves } from '../components/GradientWaves';
import { useLogin } from '../hooks/useLogin';
import PasswordFoget from '../components/PasswordFoget';
import '../styles/LoginPage.css';

// Vista de inicio de sesión del panel admin — formulario sobre fondo animado.
const LoginPage = () => {
    const { email, setEmail, password, setPassword, isSubmitting, handleSubmit, handlePasswordFoget, isOpen } = useLogin();

    return (
        <div className="login_page">
            <GradientWaves
                className="login_background"
                horizonColor="#f7fcfa"
                waveColor="#2e7d5f"
                crestColor="#86cfb0"
                speed={0.4}
                fogDepth={20}
                grainIntensity={0.03}
            />

            <div className="login_layout">
                <section className="login_card">
                    <header className="login_brand">
                        <span className="brand_icon">
                            <MdAdminPanelSettings />
                        </span>
                        <span className="brand_name">Admin BS</span>
                    </header>

                    <div className="login_heading">
                        <h1>Bienvenido</h1>
                        <p>Ingresa tus credenciales para acceder al panel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login_form">
                        <InputField
                            type="email"
                            name="email"
                            label="Correo electrónico"
                            placeholder="tu@correo.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={IoMailOutline}
                        />
                        <InputField
                            type="password"
                            name="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={IoLockClosedOutline}
                        />

                        <button type="button" className="forgot_password" onClick={handlePasswordFoget}>
                            ¿Olvidaste tu contraseña?
                        </button>

                        <Button
                            text="Iniciar sesión"
                            type="submit"
                            size="lg"
                            className="login_submit"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            icon={IoArrowForwardOutline}
                            iconPosition="left"
                        />
                    </form>

                    <p className="login_footer">Sistema de administración de Booking Sport</p>
                </section>

                <section className="login_hero">
                    <span className="hero_badge">Booking Sport</span>
                    <h2>
                        Tu negocio deportivo, <span className="hero_highlight">siempre en movimiento.</span>
                    </h2>
                    <p>Gestiona empresas, sucursales, usuarios y planes desde un solo panel.</p>
                </section>
            </div>

            <PasswordFoget isOpen={isOpen} onClose={handlePasswordFoget} />
        </div>
    );
};

export default LoginPage;
