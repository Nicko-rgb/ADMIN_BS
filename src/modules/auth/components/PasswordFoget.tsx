import { useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, Inbox, Lock, MailCheck, ShieldCheck } from 'lucide-react';
import { IoMailOutline, IoSendOutline } from 'react-icons/io5';
import { Button, FormActions, InputField, Modal } from '../../../shared/components';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { AuthService } from '../service/authService';
import '../styles/PasswordFoget.css';

interface PasswordFogetProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SentInfo {
    message: string;
    expiresInMinutes: number;
}

// Modal para solicitar el correo de recuperación de contraseña.
const PasswordFoget = ({ isOpen, onClose }: PasswordFogetProps) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState<SentInfo | null>(null);
    const [wasOpen, setWasOpen] = useState(isOpen);

    // Limpia al abrir y no al cerrar, para no cambiar el contenido durante la animación de salida
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setEmail('');
            setSent(null);
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const result = await AuthService.passwordRequest({ email });
            setSent({ message: result.message, expiresInMinutes: result.data.expiresInMinutes });
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal title="Recuperar contraseña" isOpen={isOpen} onClose={onClose} size="sm" icon={Lock}>
            {sent ? (
                <div className="password_foget_sent">
                    <span className="sent_icon">
                        <MailCheck size={34} />
                    </span>

                    <h3>Revisa tu correo</h3>
                    <p className="sent_message">{sent.message}</p>
                    <span className="sent_email">{email}</span>

                    <ul className="sent_details">
                        <li>
                            <Clock size={16} />
                            <span>El enlace vence en <strong>{sent.expiresInMinutes} minutos</strong>.</span>
                        </li>
                        <li>
                            <ShieldCheck size={16} />
                            <span>Solo puede usarse una vez.</span>
                        </li>
                        <li>
                            <Inbox size={16} />
                            <span>Si no lo ves, revisa la carpeta de spam o correo no deseado.</span>
                        </li>
                    </ul>

                    <Button text="Entendido" size="lg" className="sent_button" onClick={onClose} />
                </div>
            ) : (
                <form className="password_foget" onSubmit={handleSubmit}>
                    <p className="foget_text">Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.</p>

                    <InputField
                        type="email"
                        name="recovery_email"
                        label="Correo electrónico"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={IoMailOutline}
                        required
                    />

                    <FormActions>
                        <Button text="Cancelar" color="secondary" onClick={onClose} disabled={isSending} />
                        <Button text="Enviar correo" type="submit" loading={isSending} icon={IoSendOutline} />
                    </FormActions>
                </form>
            )}
        </Modal>
    );
};

export default PasswordFoget;
