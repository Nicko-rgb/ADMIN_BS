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

// Barra de uso de un límite del plan: "usado / máximo", con ∞ cuando es ilimitado.
export const PlanUsageBar = ({ value, label }: PlanUsageBarProps) => (
    <div className={`plan_usage_bar ${value ? usageLevel(value) : 'loading'}`}>
        <div className="plan_usage_header">
            <span className="plan_usage_label">{label}</span>
            <span className="plan_usage_count">{value ? `${value.used} / ${value.max ?? '∞'}` : '—'}</span>
        </div>
        <progress className="plan_usage_track" value={value ? usageRatio(value) : 0} max={1} aria-label={label} />
    </div>
);

export default PlanUsageBar;
