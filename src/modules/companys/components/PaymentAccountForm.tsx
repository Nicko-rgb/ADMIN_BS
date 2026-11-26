import { CheckCircle2, Landmark, Pencil, QrCode, Store, Trash2, Wallet } from 'lucide-react';
import { Dialog } from '../../../shared/components/Dialog';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, FormSection, FormRow, FormActions, LoadingScreen, EmptyScreen } from '../../../shared/components';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import type { ManualPaymentAccountFormValues } from '../interfaces/paymentConfig.interface';
import usePaymentAccountForm from '../hooks/usePaymentAccountForm';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import '../styles/PaymentAccountDetails.css';
import '../styles/PaymentAccountForm.css';

interface Props {
    branchName: string;
    branchPublicId: string;
    paymentType: PaymentType;
    isOpen: boolean;
    onClose: () => void;
    onAfterClose: () => void;
    onChanged: () => void;
}

export default function PaymentAccountForm({ branchName, branchPublicId, paymentType, isOpen, onClose, onAfterClose, onChanged }: Props) {
    const { form, exists, loading, error, busy, errors, setField, submit, remove, retry,
        savedAccount, isEditing, startEditing, cancelEditing, confirmDelete, setConfirmDelete, previewUrl, qrFile, qrError, removeQr, pickQr, discardQr, clearQrSelection } = usePaymentAccountForm(branchPublicId, paymentType, onChanged);
    const isWallet = paymentType.category === 'billetera_digital';
    const qrUrl = savedAccount?.qr?.url ?? savedAccount?.qr_url;
    const field = (name: keyof ManualPaymentAccountFormValues, label: string, maxLength: number, required = false) => (
        <InputField name={name} label={label} value={form[name]} onChange={(e) => setField(name, e.target.value)}
            maxLength={maxLength} required={required} error={errors[name]} disabled={busy !== null} />
    );

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} onAfterClose={onAfterClose} isLoading={busy !== null || confirmDelete} title={`${loading || error ? 'Cuenta de pago' : exists ? (isEditing ? 'Editar cuenta' : 'Cuenta registrada') : 'Registrar cuenta'} · ${paymentType.name}`}
            description={branchName} icon={Wallet}>
            {loading && <LoadingScreen message="Cargando cuenta…" size="sm" />}
            {!loading && error && <EmptyScreen message={error} size="sm" actionText="Reintentar" onAction={retry} />}
            {!loading && !error && !isEditing && savedAccount && (
                <>
                    <section className="payment_account_details" aria-label="Datos de la cuenta registrada">
                        <header className="account_details_header">
                            <span className="account_details_icon">
                                {paymentType.iconUrl ? <img src={paymentType.iconUrl} alt="" /> : <Wallet size={25} />}
                            </span>
                            <div className="account_details_heading">
                                <h3>{savedAccount.account_alias || paymentType.name}</h3>
                                <p><Store size={14} aria-hidden="true" />{branchName}</p>
                            </div>
                            <span className={`account_details_status ${savedAccount.isActive ? '' : 'inactive'}`}>
                                {savedAccount.isActive && <CheckCircle2 size={14} aria-hidden="true" />}
                                {savedAccount.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                        </header>
                        <div className="account_details_body">
                            <dl className="account_details_fields">
                                <div><dt>Titular de la cuenta</dt><dd>{savedAccount.account_name || 'Sin especificar'}</dd></div>
                                <div className="account_details_number">
                                    <dt>{isWallet ? 'Teléfono asociado' : 'Número de cuenta'}</dt>
                                    <dd>{savedAccount.account_number || 'Sin especificar'}</dd>
                                </div>
                                <div><dt>Alias</dt><dd>{savedAccount.account_alias || 'Sin alias'}</dd></div>
                                <div><dt><Landmark size={13} aria-hidden="true" />Nombre de banco</dt><dd>{savedAccount.bank_name || 'Sin especificar'}</dd></div>
                            </dl>
                            <figure className={`account_details_qr ${qrUrl ? '' : 'empty'}`}>
                                {qrUrl ? (
                                    <img src={resolveImageUrl(qrUrl)} alt={`Código QR de ${paymentType.name} de ${branchName}`} />
                                ) : <QrCode size={52} strokeWidth={1.3} aria-hidden="true" />}
                                <figcaption>{qrUrl ? 'QR de la cuenta' : 'Sin código QR'}</figcaption>
                            </figure>
                        </div>
                    </section>
                    <FormActions>
                        <Button text="Cerrar" type="button" color="secondary" onClick={onClose} disabled={busy !== null} />
                        <Button text="Eliminar cuenta" icon={Trash2} type="button" color="danger" disabled={busy !== null || confirmDelete} onClick={() => setConfirmDelete(true)} />
                        <Button text="Editar" icon={Pencil} type="button" disabled={busy !== null || confirmDelete} onClick={startEditing} />
                    </FormActions>
                </>
            )}
            {!loading && !error && isEditing && (
                <form className="payment_account_form" onSubmit={submit} noValidate>
                    <p className="account_notice">Una única cuenta de {paymentType.name} para {branchName}.
                        {exists && ' Los cambios reemplazan los datos de la cuenta registrada.'}</p>
                    <FormSection title="Datos de la cuenta" icon={Wallet}>
                        <FormRow>{field('account_name', 'Titular de la cuenta', 200, true)}</FormRow>
                        <FormRow>
                            {field('account_number', isWallet ? 'Teléfono asociado' : 'Número de cuenta', isWallet ? 20 : 50, true)}
                            {field('account_alias', 'Alias (opcional)', 150)}
                        </FormRow>
                        <FormRow>{field('bank_name', 'Nombre de banco (opcional)', 100)}</FormRow>
                    </FormSection>
                    <FormSection title="Código QR (opcional)" icon={QrCode}>
                        <div className="account_qr">
                            {previewUrl && <img src={previewUrl} alt={`QR de ${paymentType.name}`} className="account_qr_preview" />}
                            <label htmlFor="account_qr">{previewUrl ? 'Reemplazar imagen QR' : 'Seleccionar imagen QR'}</label>
                            <input id="account_qr" name="account_qr" type="file" accept="image/png,image/jpeg,image/webp"
                                disabled={busy !== null} aria-describedby="account_qr_help"
                                onChange={(event) => { pickQr(event.target.files?.[0] ?? null); event.target.value = ''; }} />
                            <p id="account_qr_help">PNG, JPG o WebP. Máximo 5 MB. Los cambios del QR se aplican al guardar la cuenta.</p>
                            {qrError && <p role="alert" className="account_qr_error">{qrError}</p>}
                            {removeQr && <p>El QR se eliminará al guardar.</p>}
                            <FormActions>
                                {previewUrl && <Button text="Quitar QR" type="button" color="danger" disabled={busy !== null} onClick={discardQr} />}
                                {(qrFile || removeQr || qrError) && <Button text="Deshacer cambio de QR" type="button" color="secondary" disabled={busy !== null} onClick={clearQrSelection} />}
                            </FormActions>
                        </div>
                    </FormSection>
                    <FormActions>
                        <Button text={exists ? "Cancelar edición" : "Cancelar"} type="button" color="secondary" onClick={exists ? cancelEditing : onClose} disabled={busy !== null} />
                        <Button text={exists ? 'Guardar cambios' : 'Registrar cuenta'} type="submit" loading={busy === 'save'} disabled={busy !== null || confirmDelete || Boolean(qrError)} />
                    </FormActions>
                </form>
            )}
        </Modal>
        <Dialog
            isOpen={!loading && !error && confirmDelete}
            isLoading={busy === 'delete'}
            onClose={() => { if (busy === null) setConfirmDelete(false); }}
            title={`¿Eliminar la cuenta de ${paymentType.name}?`}
            description={`Se eliminarán los datos de esta cuenta y su QR de ${branchName}.`}
            variant="danger"
            primaryAction={{ label: 'Eliminar cuenta', icon: Trash2, onClick: () => { void remove(); } }}
            secondaryAction={{ label: 'Conservar cuenta', onClick: () => setConfirmDelete(false) }}
        />
        </>
    );
}
