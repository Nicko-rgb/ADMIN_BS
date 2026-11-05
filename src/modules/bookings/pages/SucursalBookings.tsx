import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { useCompanyContextStore } from '../../../shared/store/sessionStore';
import '../styles/MyCompanys.css';

const SucursalBookings = () => {
    const { sucursalPublicId } = useParams<{ sucursalPublicId: string }>();
    const location = useLocation();
    const companies = useCompanyContextStore((state) => state.companies);
    const branch = companies.flatMap((company) => company.sucursales)
        .find((item) => item.publicId === sucursalPublicId && item.access);
    const state = location.state as { branchName?: unknown; returnTo?: unknown } | null;
    const branchName = branch?.name || (typeof state?.branchName === 'string' ? state.branchName : 'Sucursal');
    const returnTo = typeof state?.returnTo === 'string' && (state.returnTo === '/bookings' || state.returnTo.startsWith('/bookings?'))
        ? state.returnTo : '/bookings';

    return (
        <main className="booking_companies_page">
            <Header title={branchName} subtitle="Reservas de la sucursal" icon={CalendarDays} breadcrumbs={[{ label: 'Reservas', path: returnTo }]} />
            <div className="booking_companies_message">
                <p>El calendario y el selector de espacios de esta sucursal estarán disponibles próximamente.</p>
                <Link className="booking_sucursal_back" to={returnTo}>Volver a reservas</Link>
            </div>
        </main>
    );
};

export default SucursalBookings;
