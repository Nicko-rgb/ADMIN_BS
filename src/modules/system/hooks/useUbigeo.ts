import { useState } from 'react';
import type { FormEvent } from 'react';
import UbigeoService from '../service/ubigeoService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import type { Country, UbigeoNode } from '../interfaces/catalog.interface';

type ModalMode = 'create' | 'edit';

// Contexto de qué se está creando/editando — country_id y parent_id nunca los completa el usuario,
// vienen de la rama del árbol donde se hizo click en "+" o en editar.
interface ModalContext {
    mode: ModalMode;
    level: number;
    id?: number;
    parentId: number | null;
    countryId: number;
    parentLabel: string | null;
}

/**
 * Árbol de ubigeo — países como raíz (carpetas), niveles 1/2/3 en cascada por debajo. Solo una
 * rama queda expandida a la vez en cada profundidad (los hermanos se ocultan mientras esa rama
 * está abierta) — el fetch de cada nivel reutiliza `loadUbigeoChildren` de useCatalogActive
 * (mismo endpoint público en cascada que ya consumían los selects). Crear/editar/eliminar
 * funciona en cualquier nodo, sin importar el nivel — a diferencia de la tabla vieja, que solo
 * exponía las hojas.
 */
export const useUbigeo = () => {
    const { countries, loadUbigeoChildren } = useCatalogActive();

    const [expandedCountryId, setExpandedCountryId] = useState<number | null>(null);
    const [expandedLevel1Id, setExpandedLevel1Id] = useState<number | null>(null);
    const [expandedLevel2Id, setExpandedLevel2Id] = useState<number | null>(null);

    const [level1Items, setLevel1Items] = useState<UbigeoNode[]>([]);
    const [level2Items, setLevel2Items] = useState<UbigeoNode[]>([]);
    const [level3Items, setLevel3Items] = useState<UbigeoNode[]>([]);

    const [isLoadingLevel1, setIsLoadingLevel1] = useState(false);
    const [isLoadingLevel2, setIsLoadingLevel2] = useState(false);
    const [isLoadingLevel3, setIsLoadingLevel3] = useState(false);

    const [modalContext, setModalContext] = useState<ModalContext | null>(null);
    const [form, setForm] = useState({ name: '', code: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [deletingNode, setDeletingNode] = useState<UbigeoNode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLevel1 = async (countryId: number) => {
        setIsLoadingLevel1(true);
        setLevel1Items(await loadUbigeoChildren({ countryId }));
        setIsLoadingLevel1(false);
    };

    const fetchLevel2 = async (parentId: number) => {
        setIsLoadingLevel2(true);
        setLevel2Items(await loadUbigeoChildren({ parentId }));
        setIsLoadingLevel2(false);
    };

    const fetchLevel3 = async (parentId: number) => {
        setIsLoadingLevel3(true);
        setLevel3Items(await loadUbigeoChildren({ parentId }));
        setIsLoadingLevel3(false);
    };

    const toggleCountry = async (country: Country) => {
        if (expandedCountryId === country.id) {
            setExpandedCountryId(null);
            setExpandedLevel1Id(null);
            setExpandedLevel2Id(null);
            setLevel1Items([]);
            setLevel2Items([]);
            setLevel3Items([]);
            return;
        }

        setExpandedCountryId(country.id);
        setExpandedLevel1Id(null);
        setExpandedLevel2Id(null);
        setLevel2Items([]);
        setLevel3Items([]);
        await fetchLevel1(country.id);
    };

    const toggleLevel1 = async (node: UbigeoNode) => {
        if (expandedLevel1Id === node.id) {
            setExpandedLevel1Id(null);
            setExpandedLevel2Id(null);
            setLevel2Items([]);
            setLevel3Items([]);
            return;
        }

        setExpandedLevel1Id(node.id);
        setExpandedLevel2Id(null);
        setLevel3Items([]);
        await fetchLevel2(node.id);
    };

    const toggleLevel2 = async (node: UbigeoNode) => {
        if (expandedLevel2Id === node.id) {
            setExpandedLevel2Id(null);
            setLevel3Items([]);
            return;
        }

        setExpandedLevel2Id(node.id);
        await fetchLevel3(node.id);
    };

    // Breadcrumb — volver a mostrar el nivel 1 (colapsa nivel 1 y 2) o el nivel 2 (colapsa solo nivel 2), sin salir del país.
    const collapseToLevel1List = () => {
        setExpandedLevel1Id(null);
        setExpandedLevel2Id(null);
        setLevel2Items([]);
        setLevel3Items([]);
    };

    const collapseToLevel2List = () => {
        setExpandedLevel2Id(null);
        setLevel3Items([]);
    };

    const collapseToCountries = () => {
        setExpandedCountryId(null);
        setExpandedLevel1Id(null);
        setExpandedLevel2Id(null);
        setLevel1Items([]);
        setLevel2Items([]);
        setLevel3Items([]);
    };

    const reloadCurrentLevel = async (level: number) => {
        if (level === 1 && expandedCountryId !== null) await fetchLevel1(expandedCountryId);
        else if (level === 2 && expandedLevel1Id !== null) await fetchLevel2(expandedLevel1Id);
        else if (level === 3 && expandedLevel2Id !== null) await fetchLevel3(expandedLevel2Id);
    };

    // Abre el modal para crear el nivel 1 de un país (parent_id null).
    const openCreateLevel1 = (country: Country) => {
        setModalContext({ mode: 'create', level: 1, parentId: null, countryId: country.id, parentLabel: country.country });
        setForm({ name: '', code: '' });
    };

    // Abre el modal para crear un hijo directo de cualquier nodo visible (nivel 1 → crea nivel 2, nivel 2 → crea nivel 3).
    const openCreateChild = (parent: UbigeoNode) => {
        setModalContext({ mode: 'create', level: parent.level + 1, parentId: parent.id, countryId: parent.countryId, parentLabel: parent.name });
        setForm({ name: '', code: '' });
    };

    // Abre el modal para editar cualquier nodo, sin importar su nivel — a diferencia de la tabla vieja, que solo exponía hojas.
    const openEdit = (node: UbigeoNode) => {
        setModalContext({ mode: 'edit', level: node.level, id: node.id, parentId: node.parentId, countryId: node.countryId, parentLabel: null });
        setForm({ name: node.name, code: node.code });
    };

    const closeModal = () => setModalContext(null);

    const setField = (name: 'name' | 'code') => (value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!modalContext) return;

        setIsSaving(true);
        toast.loading(modalContext.mode === 'create' ? 'Registrando...' : 'Guardando cambios...');
        try {
            const result = modalContext.mode === 'create'
                ? await UbigeoService.create(trimValues({ ...form, country_id: modalContext.countryId, parent_id: modalContext.parentId }))
                : await UbigeoService.update(modalContext.id as number, trimValues(form));

            toast.success(result.message);
            const level = modalContext.level;
            closeModal();
            await reloadCurrentLevel(level);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const openDelete = (node: UbigeoNode) => setDeletingNode(node);
    const closeDelete = () => setDeletingNode(null);

    const confirmDelete = async () => {
        if (!deletingNode) return;

        setIsDeleting(true);
        toast.loading('Eliminando...');
        try {
            const result = await UbigeoService.delete(deletingNode.id);
            toast.success(result.message);

            // Si el nodo eliminado era el que estaba expandido, colapsa esa rama antes de recargar.
            if (deletingNode.level === 1 && expandedLevel1Id === deletingNode.id) collapseToLevel1List();
            if (deletingNode.level === 2 && expandedLevel2Id === deletingNode.id) collapseToLevel2List();

            const level = deletingNode.level;
            closeDelete();
            await reloadCurrentLevel(level);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    const expandedCountry = countries.find((c) => c.id === expandedCountryId) ?? null;
    const expandedLevel1 = level1Items.find((n) => n.id === expandedLevel1Id) ?? null;
    const expandedLevel2 = level2Items.find((n) => n.id === expandedLevel2Id) ?? null;

    return {
        countries,
        expandedCountry, expandedLevel1, expandedLevel2,
        level1Items, level2Items, level3Items,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        toggleCountry, toggleLevel1, toggleLevel2,
        collapseToCountries, collapseToLevel1List, collapseToLevel2List,
        openCreateLevel1, openCreateChild, openEdit, closeModal,
        modalContext, isModalOpen: modalContext !== null, form, setField, handleSubmit, isSaving,
        deletingNode, isDeleteOpen: deletingNode !== null, openDelete, closeDelete, confirmDelete, isDeleting,
    };
};
