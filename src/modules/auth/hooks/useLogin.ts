import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../../../shared/utils/toast';
import { AuthService } from '../service/authService';
import { useSessionStore } from '../../../shared/store/sessionStore';
import { handleApiError } from '../../../shared/utils/errorHandler';

// Estado y submit del formulario de login — llama a AuthService y guarda la sesión.
export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const setSession = useSessionStore((state) => state.setSession);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const session = await AuthService.loginAdmin({ email, password });
            setSession(session);
            toast.success('Sesión iniciada exitosamente');
            navigate('/home');
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return { email, setEmail, password, setPassword, isSubmitting, handleSubmit };
};
