// Informacion de la compania
import { useNavigate } from 'react-router-dom';

const Company = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Compania Informacion</h1>
            <button onClick={() => navigate('/companys')}>VOLVER</button>
        </div>
    );
}
export default Company;