import { BadgeCheck, CalendarDays, KeyRound, Mail, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Header } from '../../../shared/components/Header';
import { LoadingScreen, ForbiddenScreen, Button } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import ProfileCompanyContext from '../components/ProfileCompanyContext';
import useProfile from '../hooks/useProfile';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import { DOCUMENT_TYPE_LABELS, ROLE_LABELS } from '../utils/userConstants';
import type { DocumentType, ManagedRole, UserDetail } from '../interfaces/user.interface';
import PasswordFoget from '../../auth/components/PasswordFoget';
import '../styles/Profile.css';

const profileName = (profile: UserDetail) =>
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Usuario';

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const displayDate = (value: string | null) => {
    if (!value) return 'No registrado';
    const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(parsed.getTime()) ? 'No registrado' : new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed);
};

const valueOrFallback = (value: string | null, fallback = 'No registrado') => value || fallback;

// Vista de cuenta del usuario autenticado. La edición se incorporará en una sección posterior.
const Profile = () => {
    const can = usePermission();
    const canReadProfile = can('user.profile_edit');
    const { profile, isLoading } = useProfile();
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const [isPasswordFogetOpen, setPasswordFogetOpen] = useState(false);

    if (!canReadProfile) {
        return <ForbiddenScreen message="No tenés acceso a tu perfil." />;
    }

    if (isLoading || !profile) {
        return <LoadingScreen message="Cargando tu perfil..." size="lg" />;
    }

    const name = profileName(profile);
    const role = ROLE_LABELS[profile.role as ManagedRole] ?? profile.role;
    const documentType = profile.documentType ? DOCUMENT_TYPE_LABELS[profile.documentType as DocumentType] : null;

    return (
        <div className="profile_page">
            <main>

                <Header title="Mi perfil" subtitle="Tu cuenta, acceso y seguridad" icon={UserCircle} showCard={false} />

                <section className="profile_hero card" aria-labelledby="profile-name">
                    <div className="profile_avatar" aria-hidden="true">{initials(name)}</div>
                    <div className="profile_hero_copy">
                        <div className="profile_role"><BadgeCheck size={15} />{role}</div>
                        <h2 id="profile-name">{name}</h2>
                        <p>{valueOrFallback(profile.email, 'Sin correo registrado')}</p>
                    </div>
                    <div className="profile_account_status"><span /><div><strong>Cuenta activa</strong><small>Tu acceso está habilitado</small></div></div>
                </section>

                <div className={`profile_content ${scopeLevel === 1 ? 'system_profile' : ''}`}>
                    <section className="card profile_card" aria-labelledby="profile-data-title">
                        <div className="profile_section_heading">
                            <div className="profile_section_icon"><UserCircle size={20} /></div>
                            <div><h2 id="profile-data-title">Datos de cuenta</h2><p>Información registrada para tu usuario.</p></div>
                        </div>

                        <dl className="profile_data_list">
                            <div><dt><Mail size={16} />Correo</dt><dd>{valueOrFallback(profile.email)}</dd></div>
                            <div><dt><Phone size={16} />Teléfono</dt><dd>{valueOrFallback(profile.phone)}</dd></div>
                            <div><dt><BadgeCheck size={16} />Documento</dt><dd>{documentType && profile.documentNumber ? `${documentType} · ${profile.documentNumber}` : 'No registrado'}</dd></div>
                            <div><dt><CalendarDays size={16} />Fecha de nacimiento</dt><dd>{displayDate(profile.dateBirth)}</dd></div>
                        </dl>
                    </section>

                    <section className="card profile_security_card" aria-labelledby="profile-security-title">
                        <div className="profile_section_heading">
                            <div className="profile_section_icon security"><ShieldCheck size={20} /></div>
                            <div><h2 id="profile-security-title">Seguridad</h2><p>Estado de las opciones disponibles hoy.</p></div>
                        </div>

                        <div className="profile_security_list">
                            <article>
                                <div className="profile_security_icon"><KeyRound size={18} /></div>
                                <div><h3>Contraseña</h3><p>Podés restablecerla mediante un enlace enviado a tu correo.</p></div>
                                <Button text="Restablecer" icon={KeyRound} onClick={() => setPasswordFogetOpen(true)} size='sm'color='accent' />
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
            <PasswordFoget isOpen={isPasswordFogetOpen} onClose={() => setPasswordFogetOpen(false)} />
        </div>
    );
};

export default Profile;
