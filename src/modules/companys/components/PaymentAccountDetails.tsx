import { CheckCircle2, Landmark, QrCode, Store, Wallet } from 'lucide-react';
import type { ManualPaymentAccount } from '../interfaces/paymentConfig.interface';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import '../styles/PaymentAccountDetails.css';

interface Props {
    account: ManualPaymentAccount;
    paymentType: PaymentType;
    branchName: string;
}

export default function PaymentAccountDetails({ account, paymentType, branchName }: Props) {
    const qrUrl = account.qr?.url ?? account.qr_url;
    return (
        <section className="payment_account_details" aria-label="Datos de la cuenta registrada">
            <header className="account_details_header">
                <span className="account_details_icon">
                    {paymentType.iconUrl ? <img src={paymentType.iconUrl} alt="" /> : <Wallet size={25} />}
                </span>
                <div className="account_details_heading">
                    <h3>{account.account_alias || paymentType.name}</h3>
                    <p><Store size={14} aria-hidden="true" />{branchName}</p>
                </div>
                <span className={`account_details_status ${account.isActive ? '' : 'inactive'}`}>
                    {account.isActive && <CheckCircle2 size={14} aria-hidden="true" />}
                    {account.isActive ? 'Activa' : 'Inactiva'}
                </span>
            </header>
            <div className="account_details_body">
                <dl className="account_details_fields">
                    <div><dt>Titular de la cuenta</dt><dd>{account.account_name || 'Sin especificar'}</dd></div>
                    <div className="account_details_number">
                        <dt>{paymentType.category === 'billetera_digital' ? 'Teléfono asociado' : 'Número de cuenta'}</dt>
                        <dd>{account.account_number || 'Sin especificar'}</dd>
                    </div>
                    <div><dt>Alias</dt><dd>{account.account_alias || 'Sin alias'}</dd></div>
                    <div><dt><Landmark size={13} aria-hidden="true" />Nombre de banco</dt><dd>{account.bank_name || 'Sin especificar'}</dd></div>
                </dl>
                <figure className={`account_details_qr ${qrUrl ? '' : 'empty'}`}>
                    {qrUrl ? (
                        <img src={resolveImageUrl(qrUrl)} alt={`Código QR de ${paymentType.name} de ${branchName}`} />
                    ) : <QrCode size={52} strokeWidth={1.3} aria-hidden="true" />}
                    <figcaption>{qrUrl ? 'QR de la cuenta' : 'Sin código QR'}</figcaption>
                </figure>
            </div>
        </section>
    );
}
