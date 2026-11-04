import { BadgeCheck, Building2, CalendarDays, CheckCircle2, CreditCard, Crown, Edit, KeyRound, Mail, Phone, ShieldCheck, UserCircle, UploadCloud, X } from 'lucide-react';
import { LoadingScreen, ForbiddenScreen, Button, Header, Modal, FormActions } from '../../../shared/components';
import ProfileCompanyContext from '../components/ProfileCompanyContext';
import UserProfileFields from '../components/UserProfileFields';
import useProfile from '../hooks/useProfile';
import type { HeaderSectionProps } from '../interfaces/user.interface';
import PasswordFoget from '../../auth/components/PasswordFoget';
import '../styles/Profile.css';

const HeaderSections = ({ title, subtitle, icon: Icon, extra, className }: HeaderSectionProps) => {
    return (
        <div className={`section_heading ${className}`} >
            <div className='heading_left'>
                <div className="icon"><Icon size={20} /></div>
                <div><h2>{title}</h2><p>{subtitle}</p></div>
            </div>
            {extra}
        </div>
    );
}

// Vista de cuenta del usuario autenticado. La edición se incorporará en una sección posterior.
const Profile = () => {
    const {
        canReadProfile, scopeLevel, companies,
        profile,
        isLoading,
        subscription,
        subscriptionState,
        nextInvoiceLabel,
        billingPeriodLabel,
        name,
        initials,
        roleLabel,
        documentLabel,
        birthDateLabel,
        isLoadingSubscription,
        isSavingProfile,
        isPasswordFogetOpen, openPasswordReset, closePasswordReset,
        isEditProfileOpen, editForm,
        openEditProfile, closeEditProfile, setEditField, submitEditProfile,
        navigateToSubscriptions,
    } = useProfile();
    if (!canReadProfile) {
        return <ForbiddenScreen message="No tienes acceso a tu perfil." />;
    }

    if (isLoading || !profile) {
        return <LoadingScreen message="Cargando tu perfil..." />;
    }

    return (
        <div className="profile_page">
            <main>
                <Header title="Mi perfil" subtitle="Tu cuenta, acceso y seguridad" icon={UserCircle} showCard={false} />
                <section className="profile_hero card">
                    <div className="avatar center">{initials}</div>
                    <div className="hero_copy">
                        <h2>{name}<div className="role"><BadgeCheck size={15} />{roleLabel}</div></h2>
                        <p>{profile.email}</p>
                    </div>
                    <div className="account_status"><span /><strong>Cuenta activa</strong></div>
                </section>

                <div className={`profile_content ${scopeLevel === 1 ? 'system_profile' : ''}`}>
                    <div className='group_content'>
                        <section className="card profile_card">
                            <HeaderSections title='Datos de la cuenta' icon={UserCircle} subtitle='Información registrada para tu usuario.'
                                extra={<Button text='Editar' icon={Edit} size='sm' onClick={openEditProfile} />}
                            />
                            <dl className="profile_data_list">
                                <div><dt><Mail size={16} />Correo</dt><dd>{profile.email}</dd></div>
                                <div><dt><Phone size={16} />Teléfono</dt><dd>{profile.phone}</dd></div>
                                <div><dt><BadgeCheck size={16} />Documento</dt><dd>{documentLabel && profile.documentNumber ? `${documentLabel} · ${profile.documentNumber}` : 'No registrado'}</dd></div>
                                <div><dt><CalendarDays size={16} />Fecha de nacimiento</dt><dd>{birthDateLabel}</dd></div>
                            </dl>
                        </section>

                        {scopeLevel !== 1 && (
                            <section className='card profile_subscription_card'>
                                <HeaderSections
                                    title='Mi suscripción'
                                    icon={BadgeCheck}
                                    subtitle='Plan y estado de tu empresa.'
                                    className='accent'
                                    extra={<Button text='Ver Suscripciones' icon={Crown} size='sm' color='accent' onClick={navigateToSubscriptions} />}
                                />

                                {isLoadingSubscription ? (
                                    <LoadingScreen message="Cargando suscripción..." />
                                ) : subscription && subscriptionState ? (
                                    <>
                                        <div className='subscription_header'>
                                            <div>
                                                <span className='subscription_eyebrow'>Tu plan</span>
                                                <div className='subscription_plan'>
                                                    <span className='subscription_plan_name'>{subscription.plan?.name ?? 'Sin plan'}</span>
                                                    {subscription.plan && <span className='subscription_plan_code'>{subscription.plan.code}</span>}
                                                </div>
                                            </div>
                                            <div className='subscription_chips'>
                                                <span className={`subscription_badge ${subscriptionState.tone}`}>{subscriptionState.label}</span>
                                                <span className={`subscription_badge ${subscription.isEffective ? 'success' : 'neutral'}`}>
                                                    <CheckCircle2 size={14} />{subscription.isEffective ? 'Vigente' : 'No vigente'}
                                                </span>
                                            </div>
                                        </div>

                                        <dl className='subscription_data_list'>
                                            <div>
                                                <dt><CalendarDays size={15} />{subscription.isEffective ? 'Próxima factura' : 'Fin del período'}</dt>
                                                <dd>{nextInvoiceLabel}</dd>
                                            </div>
                                            <div>
                                                <dt><CreditCard size={15} />Facturación</dt>
                                                <dd>{billingPeriodLabel}</dd>
                                            </div>
                                            <div>
                                                <dt><Building2 size={15} />Empresa titular</dt>
                                                <dd>{subscription.primaryCompany?.name ?? '—'}</dd>
                                            </div>
                                        </dl>

                                        {subscription.status === 'CANCELED' && subscription.isEffective ? (
                                            <p className='subscription_note'>La suscripción está cancelada y conserva el acceso hasta el final del período actual.</p>
                                        ) : subscription.cancelAtPeriodEnd && subscription.isEffective && (
                                            <p className='subscription_note'>La suscripción se cancela al final del período actual.</p>
                                        )}
                                    </>
                                ) : (
                                    <p className='subscription_state'>No se pudo cargar la suscripción o esta empresa no tiene una registrada.</p>
                                )}
                            </section>
                        )}
                    </div>

                    <section className="card profile_security_card">
                        <HeaderSections title='Seguridad' icon={ShieldCheck} subtitle='Estado de las opciones disponibles hoy.' className='accent' />
                        <div className="profile_security_list">
                            <article>
                                <div className="profile_security_icon"><KeyRound size={18} /></div>
                                <div><h3>Contraseña</h3><p>Podés restablecerla mediante un enlace enviado a tu correo.</p></div>
                                <Button text="Restablecer" icon={KeyRound} onClick={openPasswordReset} size='sm' color='accent' />
                            </article>
                            <article>
                                <div className="profile_security_icon"><ShieldCheck size={18} /></div>
                                <div><h3>Sesión actual</h3><p>Tu sesión está protegida con un token de acceso y se puede cerrar desde el menú.</p></div>
                                <span className="profile_security_status active">Activa</span>
                            </article>
                            <article>
                                <div className="profile_security_icon muted"><BadgeCheck size={18} /></div>
                                <div><h3>Sesiones al cambiar contraseña</h3><p>El backend invalida las sesiones existentes cuando se restablece la contraseña.</p></div>
                                <span className="profile_security_status neutral">Protegido</span>
                            </article>
                        </div>
                    </section>

                    {scopeLevel !== 1 && <ProfileCompanyContext companies={companies} scopeLevel={scopeLevel} />}
                </div>
            </main>
            <Modal isOpen={isEditProfileOpen} onClose={closeEditProfile} title="Editar mis datos" description="Actualiza tu información personal." icon={Edit} isLoading={isSavingProfile}>
                {editForm && (
                    <form onSubmit={submitEditProfile}>
                        <UserProfileFields form={editForm} setField={setEditField} />
                        <FormActions>
                            <Button text="Cancelar" icon={X} color="secondary" type="button" onClick={closeEditProfile} />
                            <Button text="Guardar cambios" icon={UploadCloud} type="submit" loading={isSavingProfile} />
                        </FormActions>
                    </form>
                )}
            </Modal>
            <PasswordFoget isOpen={isPasswordFogetOpen} onClose={closePasswordReset} />
        </div>
    );
};

export default Profile;
