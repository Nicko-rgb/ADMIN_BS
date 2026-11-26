import { KeyRound, ShieldCheck, UploadCloud, Unplug, Wallet, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { EmptyScreen, LoadingScreen } from '../../../shared/components';
import { InputField, SelectField, FormSection, FormRow, FormActions } from '../../../shared/components';
import useMercadoPagoForm, { MERCADO_PAGO_ENVIRONMENT_OPTIONS } from '../hooks/useMercadoPagoForm';
import type { PaymentConfigStatus } from '../interfaces/paymentConfig.interface';
import '../styles/MercadoPagoForm.css';

interface MercadoPagoFormProps {
    sucursalPublicId: string;
    sucursalName: string;
    isConnected: boolean;
    status: PaymentConfigStatus;
    error: string;
    isOpen: boolean;
    onClose: () => void;
    onAfterClose: () => void;
    onRetry: () => void;
    onChanged: () => void;
}

/**
 * Modal de Mercado Pago de una sucursal.
 *
 * Solo dos caminos: si ya hay una cuenta muestra el botón Desconectar; si no,
 * el formulario de tokens. Desconectar elimina la credencial y deja el
 * formulario listo sin cerrar el modal.
 */
export const MercadoPagoForm = ({
    sucursalPublicId,
    sucursalName,
    isConnected,
    status,
    error,
    isOpen,
    onAfterClose,
    onClose,
    onRetry,
    onChanged,
}: MercadoPagoFormProps) => {
    const {
        form, setField, setEnvironment, errors, isSubmitting, handleSubmit,
        isConnected: showConnected, isDisconnecting, disconnect,
    } = useMercadoPagoForm({ sucursalPublicId, isConnected, onChanged });

    const isChecking = status === 'loading';
    const hasError = status === 'error';

    return (
        <Modal
            isOpen={isOpen}
            onAfterClose={onAfterClose}
            onClose={onClose}
            isLoading={isSubmitting || isDisconnecting}
            title="Conectar Mercado Pago"
            description={`Cuenta de Mercado Pago de ${sucursalName}`}
            icon={Wallet}
        >
            {isChecking && <LoadingScreen message="Verificando cuenta..." size="sm" />}

            {hasError && (
                <EmptyScreen
                    message={error || 'No se pudo verificar Mercado Pago'}
                    size="sm"
                    actionText="Reintentar"
                    onAction={onRetry}
                />
            )}

            {!isChecking && !hasError && showConnected && (
                <div className="mp_account">
                    <div className="mp_connected_status">
                        <span className="mp_connected_icon"><ShieldCheck size={20} /></span>
                        <div>
                            <strong>Mercado Pago conectado</strong>
                            <p>
                                Esta sucursal ya tiene una cuenta conectada. Para registrar otra,
                                desconectala y vuelve a ingresar sus tokens.
                            </p>
                        </div>
                    </div>

                    <FormActions>
                        <Button text="Cerrar" color="secondary" size="lg" type="button" onClick={onClose} disabled={isDisconnecting} />
                        <Button
                            text="Desconectar"
                            color="danger"
                            icon={Unplug}
                            size="lg"
                            type="button"
                            loading={isDisconnecting}
                            onClick={() => { void disconnect(); }}
                        />
                    </FormActions>
                </div>
            )}

            {!isChecking && !hasError && !showConnected && (
                <form className="mp_form" onSubmit={handleSubmit} noValidate>
                    <FormSection title="Credenciales" icon={KeyRound}>
                        <FormRow>
                            <InputField
                                name="access_token"
                                label="Access token"
                                type="password"
                                value={form.access_token}
                                onChange={(e) => setField('access_token')(e.target.value)}
                                placeholder="APP_USR-..."
                                autoComplete="off"
                                required
                                error={errors.access_token}
                            />
                        </FormRow>

                        <FormRow>
                            <InputField
                                name="public_key"
                                label="Public key (Opcional)"
                                value={form.public_key}
                                onChange={(e) => setField('public_key')(e.target.value)}
                                placeholder="APP_USR-..."
                                autoComplete="off"
                                error={errors.public_key}
                            />
                            <SelectField
                                name="environment"
                                label="Ambiente"
                                value={form.environment}
                                options={MERCADO_PAGO_ENVIRONMENT_OPTIONS}
                                onChange={(e) => setEnvironment(String(e.target.value))}
                                required
                            />
                        </FormRow>
                    </FormSection>

                    <p className="mp_form_note">
                        <ShieldCheck size={15} />
                        El access token se guarda encriptado y nunca vuelve al navegador.
                    </p>

                    <FormActions>
                        <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} disabled={isSubmitting} />
                        <Button text="Conectar" icon={UploadCloud} size="lg" type="submit" loading={isSubmitting} />
                    </FormActions>
                </form>
            )}
        </Modal>
    );
};

export default MercadoPagoForm;
