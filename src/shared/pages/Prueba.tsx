
import './prueba.css'
import { Button } from '../components';
import { Home } from 'lucide-react';

const PagePrueba = () => {
    return (
        <div className="prueba center">
            <Button text='Mi Boton' size='xs' icon={Home} />
            <Button text='Mi Boton' size='sm' icon={Home} />
            <Button text='Mi Boton' size='md' icon={Home} />
            <Button text='Mi Boton' size='lg' icon={Home} />
        </div>
    )
}

export default PagePrueba;