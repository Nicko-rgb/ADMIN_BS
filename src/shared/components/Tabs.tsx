import type { ComponentType } from 'react';
import '../styles/Tabs.css';

export interface TabItem {
    key: string;
    label: string;
    icon?: ComponentType<{ size?: number }>;
}

interface TabsProps {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
}

/** Barra de pestañas simple — cambia qué sección de una página se muestra sin navegar de ruta. */
export const Tabs = ({ tabs, activeKey, onChange }: TabsProps) => (
    <div className="tabs_bar" role="tablist">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeKey;
            return (
                <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`tabs_bar_item ${isActive ? 'active' : ''}`}
                    onClick={() => onChange(tab.key)}
                >
                    {Icon && <Icon size={16} />}
                    {tab.label}
                </button>
            );
        })}
    </div>
);

export default Tabs;
