import { useState } from 'react';
import type { ComponentType, FormEvent } from 'react';
import { Settings, Share2, Clock, CircleCheck, CircleX, Wrench, UploadCloud, X, Image } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Tabs } from '../../../shared/components/Tabs';
import { InputField, TextAreaField, FormSection, FormRow, FormActions, LoadingScreen } from '../../../shared/components';
import useSucursalConfig from '../hooks/useSucursalConfig';
import type { SucursalStatus } from '../interfaces/sucursal.interface';
import type { SucursalConfigFormValues } from '../interfaces/sucursalConfig.interface';

interface SucursalConfigFormProps {
    onClose: () => void;
    // public_id de la sucursal a configurar — el endpoint resuelve el resto.
    sucursalPublicId: string;
    // Estado actual de la sucursal — valor inicial del segmentado sin config.
    currentStatus: SucursalStatus | null;
    // Se llama tras guardar — la página recarga para reflejar los cambios.
    onSaved?: () => void;
}

type ConfigTab = 'operativo' | 'redes' | 'imagen';

// Campos de cada tab — para llevar al usuario al tab con errores al fallar el submit.
const OPERATIVO_FIELDS: (keyof SucursalConfigFormValues)[] = ['opening_time', 'closing_time', 'min_price', 'features'];

/**
 * Modal de configuración operativa de la sucursal — registro si todavía no tiene,
 * edición si ya existe (misma llamada PUT upsert). Horarios obligatorios, resto
 * opcional; `features` como texto separado por comas, igual que se guarda en DB.
 * Se monta únicamente mientras está abierto (ver Sucursal.tsx).
 */
const STATUS_OPTIONS: { value: SucursalStatus; label: string; icon: ComponentType<{ size?: number }> }[] = [
    { value: 'ACTIVE', label: 'Activa', icon: CircleCheck },
    { value: 'INACTIVE', label: 'Inactiva', icon: CircleX },
    { value: 'MAINTENANCE', label: 'Mantenimiento', icon: Wrench },
];

export const SucursalConfigForm = ({ onClose, sucursalPublicId, currentStatus, onSaved }: SucursalConfigFormProps) => {
    const {
        form, setField, errors, allErrors,
        isLoadingDetail, isSubmitting, isEditMode, handleSubmit,
    } = useSucursalConfig({ sucursalPublicId, currentStatus, onClose, onSaved });

    const [activeTab, setActiveTab] = useState<ConfigTab>('operativo');

    // Al fallar el submit lleva al tab que concentra los errores.
    const handleTabSubmit = (e: FormEvent<HTMLFormElement>) => {
        if (OPERATIVO_FIELDS.some((field) => allErrors[field])) setActiveTab('operativo');
        else if (Object.keys(allErrors).length > 0) setActiveTab('redes');
        handleSubmit(e);
    };

    return (
        <Modal isOpen onClose={onClose} title={isEditMode ? 'Editar configuración' : 'Configurar sucursal'} icon={Settings} size="lg">
            {isLoadingDetail ? (
                <LoadingScreen message="Cargando configuración..." size="sm" />
            ) : (
                <form onSubmit={handleTabSubmit} noValidate>
                    <Tabs
                        tabs={[
                            { key: 'operativo', label: 'Operativo', icon: Clock },
                            { key: 'redes', label: 'Redes sociales', icon: Share2 },
                            { key: 'imagen', label: 'Imagen', icon: Image },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as ConfigTab)}
                    />

                    {activeTab === 'operativo' && (
                        <>
                            <FormSection title="Horarios y Estado" icon={Clock}>
                                <FormRow>
                                    <InputField name="opening_time" label="Apertura" type="time" value={form.opening_time} onChange={(e) => setField('opening_time')(e.target.value)} required error={errors.opening_time} />
                                    <InputField name="closing_time" label="Cierre" type="time" value={form.closing_time} onChange={(e) => setField('closing_time')(e.target.value)} required error={errors.closing_time} />
                                    <div className="status_segmented" role="radiogroup" aria-label="Estado de la sucursal">
                                        <label>Estado</label>
                                        <div>
                                            {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={form.status === value}
                                                    className={`option ${value.toLowerCase()}${form.status === value ? ' selected' : ''}`}
                                                    onClick={() => setField('status')(value)}
                                                >
                                                    <Icon size={18} />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </FormRow>
                            </FormSection>

                            <FormSection title="Precio y características">
                                <FormRow>
                                    <InputField name="min_price" label="Precio mínimo referencial (Opcional)" numberOnly value={form.min_price} onChange={(e) => setField('min_price')(e.target.value)} placeholder="25.00" error={errors.min_price} />
                                </FormRow>
                                <FormRow>
                                    <TextAreaField name="features" label="Características (Opcional)" value={form.features} onChange={(e) => setField('features')(e.target.value)} placeholder="Estacionamiento, Vestuarios, Ducha..." error={errors.features} />
                                </FormRow>
                            </FormSection>
                        </>
                    )}

                    {activeTab === 'redes' && (
                        <FormSection title="Redes y WhatsApp" icon={Share2}>
                            <FormRow>
                                <InputField name="social_facebook" label="Facebook (Opcional)" type="url" value={form.social_facebook} onChange={(e) => setField('social_facebook')(e.target.value)} placeholder="https://facebook.com/..." error={errors.social_facebook} />
                                <InputField name="social_instagram" label="Instagram (Opcional)" value={form.social_instagram} onChange={(e) => setField('social_instagram')(e.target.value)} placeholder="https://instagram.com/..." error={errors.social_instagram} />
                            </FormRow>
                            <FormRow>
                                <InputField name="social_tiktok" label="TikTok (Opcional)" value={form.social_tiktok} onChange={(e) => setField('social_tiktok')(e.target.value)} placeholder="https://tiktok.com/..." error={errors.social_tiktok} />
                                <InputField name="social_youtube" label="YouTube (Opcional)" value={form.social_youtube} onChange={(e) => setField('social_youtube')(e.target.value)} placeholder="https://youtube.com/..." error={errors.social_youtube} />
                            </FormRow>
                            <FormRow>
                                <InputField name="social_whatsapp" label="WhatsApp (Opcional)" numberOnly="integer" value={form.social_whatsapp} onChange={(e) => setField('social_whatsapp')(e.target.value)} placeholder="51987654321" error={errors.social_whatsapp} />
                            </FormRow>
                            <FormRow>
                                <TextAreaField name="whatsapp_message" label="Mensaje de WhatsApp (Opcional)" value={form.whatsapp_message} onChange={(e) => setField('whatsapp_message')(e.target.value)} placeholder="Hola, quiero reservar..." error={errors.whatsapp_message} />
                            </FormRow>
                        </FormSection>
                    )}

                    {activeTab === 'imagen' && (
                        <div className='tab_imagen'>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlaSj8uGSIYdvnfHOt4t0wZc-Yy0r2YGihc0Y5RELmvmU4SBvNIz_KiA4&s=10" alt="" />
                        </div>
                    )}

                    <FormActions>
                        <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                        <Button text={isEditMode ? 'Guardar' : 'Guardar configuración'} icon={UploadCloud} size="lg" type="submit" loading={isSubmitting} />
                    </FormActions>
                </form>
            )}
        </Modal>
    );
};

export default SucursalConfigForm;
