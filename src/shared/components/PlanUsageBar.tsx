import type { PlanLimitUsage } from '../interfaces/planUsage.interface';
import '../styles/PlanUsageBar.css';

interface PlanUsageBarProps {
    value?: PlanLimitUsage;
    label: string;
}

// Proporción usada (0 a 1) — un límite ilimitado no se llena.
const usageRatio = ({ used, max }: PlanLimitUsage): number => {
    if (max === null) return 0;
    if (max === 0) return 1;
    return Math.min(used / max, 1);
};

// Nivel para el color de la barra: completo, cerca del tope (80%) o normal.
const usageLevel = (value: PlanLimitUsage): string => {
    if (value.max === null) return 'unlimited';
    if (value.used >= value.max) return 'full';
    return usageRatio(value) >= 0.8 ? 'warning' : 'ok';
};

// Uso de un límite del plan: label arriba, barra chica + "usado / máximo", con ∞ cuando es ilimitado.
export const PlanUsageBar = ({ value, label }: PlanUsageBarProps) => (
    <div className={`plan_usage_bar ${value ? usageLevel(value) : 'loading'}`}>
        <div className='label_box'>
            <label title={label}>{label}</label>
            <progress className="progress_bar" value={value ? usageRatio(value) : 0} max={1} />
        </div>
        <span className="usage_count">{value ? `${value.used} / ${value.max ?? '∞'}` : '—'}</span>
    </div>
);

export default PlanUsageBar;
