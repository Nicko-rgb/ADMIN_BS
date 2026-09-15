import { UserCircle, UploadCloud } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { LoadingScreen, ForbiddenScreen, FormActions } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import UserProfileFields from '../components/UserProfileFields';
import useProfile from '../hooks/useProfile';
import '../styles/Profile.css';

// Autoedición del propio perfil — reusa UserProfileFields (sin rol ni habilitado, esos son
// administrativos). El estado y el fetch viven en useProfile.
const Profile = () => {
    const can = usePermission();
    const canEdit = can('user.profile_edit');
    const { form, isLoading, isSaving, setField, handleSubmit, countryOptions } = useProfile();

    if (!canEdit) {
        return <ForbiddenScreen message="No tenés acceso para editar tu perfil." />;
    }

    if (isLoading || !form) {
        return <LoadingScreen message="Cargando tu perfil..." size="lg" />;
    }

    return (
        <div className="profile_page">
            <Header title="Mi perfil" subtitle="Tus datos personales" icon={UserCircle} />

            <div className="card profile_card">
                <form onSubmit={handleSubmit}>
                    <UserProfileFields form={form} setField={setField} countryOptions={countryOptions} />

                    <FormActions>
                        <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
                    </FormActions>
                </form>
            </div>
        </div>
    );
};

export default Profile;
