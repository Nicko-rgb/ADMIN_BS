import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LinkIcon, ShieldCheck } from 'lucide-react';
import { IoLockClosedOutline } from 'react-icons/io5';
import { Button, InputField, LoadingScreen } from '../../../shared/components';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { GradientWaves } from '../components/GradientWaves';
import { AuthService } from '../service/authService';
import '../styles/ResetPasswordPage.css';

const MIN_PASSWORD_LENGTH = 8;

// El token viaja en el fragmento (#token=...): el navegador no lo manda al servidor ni lo deja en el Referer.
// Se deja en la barra de direcciones para que la página siga funcionando al recargar.
const readTokenFromHash = (): string => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '';

// Vista de nueva contraseña — se abre desde el enlace del correo de recuperación.
const ResetPasswordPage = () => {
    const [token] = useState(readTokenFromHash);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isChecking, setIsChecking] = useState(Boolean(token));
    const [isTokenValid, setIsTokenValid] = useState(false);
    const navigate = useNavigate();

    // Comprueba contra el backend que el enlace siga vigente, sin consumirlo
    useEffect(() => {
        if (!token) return;

        let isCurrent = true;
        AuthService.passwordResetValidateToken({ token })
            .then(() => isCurrent && setIsTokenValid(true))
            .catch(() => isCurrent && setIsTokenValid(false))
            .finally(() => isCurrent && setIsChecking(false));

        return () => { isCurrent = false; };
    }, [token]);

    const isTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
    const isMismatched = confirmation.length > 0 && password !== confirmation;
    const isValid = password.length >= MIN_PASSWORD_LENGTH && password === confirmation;

    const goToLogin = () => navigate('/auth/login');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const result = await AuthService.passwordReset({ token, password });
            toast.success(result.message);
            setIsDone(true);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="reset_page">
            <GradientWaves
                className="reset_background"
                horizonColor="#f7fcfa"
                waveColor="#2e7d5f"
                crestColor="#86cfb0"
                speed={0.4}
                fogDepth={20}
                grainIntensity={0.03}
            />

            <section className="reset_card">
                {isChecking ? (
                    <LoadingScreen message="Verificando enlace..." size="sm" />
                ) : !isTokenValid ? (
                    <div className="reset_state">
                        <span className="state_icon invalid">
                            <LinkIcon size={30} />
                        </span>
                        <h1>Enlace no válido</h1>
                        <p>El enlace venció, ya se usó o está incompleto. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".</p>
                        <Button text="Ir al inicio de sesión" size="lg" className="state_button" onClick={goToLogin} />
                    </div>
                ) : isDone ? (
                    <div className="reset_state">
                        <span className="state_icon">
                            <CheckCircle2 size={30} />
                        </span>
                        <h1>Contraseña actualizada</h1>
                        <p>Ya podés ingresar al panel con tu nueva contraseña.</p>
                        <Button text="Ir al inicio de sesión" size="lg" className="state_button" onClick={goToLogin} />
                    </div>
                ) : (
                    <>
                        <header className="reset_header">
                            <span className="header_icon">
                                <ShieldCheck size={26} />
                            </span>
                            <h1>Nueva contraseña</h1>
                            <p>Elegí una contraseña de al menos {MIN_PASSWORD_LENGTH} caracteres para tu cuenta.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="reset_form">
                            <InputField
                                type="password"
                                name="new_password"
                                label="Nueva contraseña"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={IoLockClosedOutline}
                                error={isTooShort ? `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` : ''}
                                required
                            />
                            <InputField
                                type="password"
                                name="confirm_password"
                                label="Repetir contraseña"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                icon={IoLockClosedOutline}
                                error={isMismatched ? 'Las contraseñas no coinciden' : ''}
                                required
                            />

                            <Button
                                text="Guardar contraseña"
                                type="submit"
                                size="lg"
                                className="reset_submit"
                                disabled={!isValid}
                                loading={isSending}
                            />
                        </form>
                    </>
                )}
            </section>
        </div>
    );
};

export default ResetPasswordPage;
