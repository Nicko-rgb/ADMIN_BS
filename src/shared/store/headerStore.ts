import { create } from 'zustand';
import { useLayoutEffect, useState } from 'react';
import type { HeaderConfig } from '../interfaces/header.interface';

interface HeaderState {
    config: HeaderConfig;
    owner: symbol | null;
    setHeader: (owner: symbol, config: HeaderConfig) => void;
    patchHeader: (config: Partial<HeaderConfig>) => void;
    resetHeader: (owner: symbol) => void;
}

const EMPTY_HEADER: HeaderConfig = { visible: true, showNotification: true, showCard: true };

/**
 * Header global del panel admin. AppLayout lo renderiza una sola vez y cada
 * página lo configura con `usePageHeader`. No se persiste: es estado de UI
 * que debe nacer y morir con la página que lo declara.
 */
export const useHeaderStore = create<HeaderState>((set) => ({
    config: EMPTY_HEADER,
    owner: null,
    setHeader: (owner, config) => set({
        owner,
        config: {
            visible: true,
            showNotification: true,
            showCard: true,
            ...config,
        },
    }),
    patchHeader: (config) => set((state) => ({
        config: { ...state.config, ...config },
    })),
    resetHeader: (owner) => set((state) => state.owner === owner ? { config: EMPTY_HEADER, owner: null } : state),
}));

/** Configura el header de la página actual y lo limpia al desmontarla. */
export const usePageHeader = (config: HeaderConfig): void => {
    const [owner] = useState(() => Symbol('page-header'));
    const setHeader = useHeaderStore((state) => state.setHeader);
    const resetHeader = useHeaderStore((state) => state.resetHeader);

    useLayoutEffect(() => {
        setHeader(owner, config);
    });

    useLayoutEffect(() => () => resetHeader(owner), [owner, resetHeader]);
};
