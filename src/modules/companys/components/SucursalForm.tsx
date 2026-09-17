import { Store, MapPin, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, TextAreaField, FormSection, FormRow, FormActions, LoadingScreen } from '../../../shared/components';
import useSucursalForm from '../hooks/useSucursalForm';

interface SucursalFormProps {
    onClose: () => void;
    // Empresa bajo la que se registra la sucursal nueva.
    companyTenantId?: string;
    // Sucursal a editar; null en alta.
    sucursalTenantId: string | null;
    onSaved: () => void;
}

/**
 * Modal de alta y edición de sucursal — mismo formulario para los dos modos, solo cambian el
 * título y el texto del botón. Se monta únicamente mientras está abierto (ver Company.tsx).
 */
export const SucursalForm = ({ onClose, companyTenantId, sucursalTenantId, onSaved }: SucursalFormProps) => {
    const {
        isEditMode, isLoadingDetail, isSubmitting,
        form, setField, errors, countryOptions,
        departments, provinces, districts, departmentId, provinceId,
        selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        handleSubmit,
    } = useSucursalForm({ companyTenantId, sucursalTenantId, onClose, onSaved });

    return (
        <Modal isOpen onClose={onClose} title={isEditMode ? 'Editar sucursal' : 'Nueva sucursal'} icon={Store} size="lg">
            {isLoadingDetail ? (
                <LoadingScreen message="Cargando sucursal..." size="sm" />
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <FormSection title="Información general" icon={Store}>
                        <FormRow>
                            <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required error={errors.name} />
                            <InputField name="phone_cell" label="Teléfono celular" numberOnly={'integer'} value={form.phone_cell} onChange={(e) => setField('phone_cell')(e.target.value)} required error={errors.phone_cell} />
                        </FormRow>
                        <FormRow>
                            <InputField name="phone" label="Teléfono fijo (Opcional)" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} />
                            <InputField name="address" label="Dirección" value={form.address} onChange={(e) => setField('address')(e.target.value)} required error={errors.address} />
                        </FormRow>

                        <FormRow>
                            <InputField name="website" type='url' label="Sitio Web (opcional)" placeholder='https://sitio.com' value={form.website} onChange={(e) => setField('website')(e.target.value)} error={errors.website} />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Ubicación" icon={MapPin}>
                        <FormRow>
                            <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => selectCountry(Number(e.target.value))} options={countryOptions} required error={errors.country_id} />
                            <SelectField
                                name="department_id"
                                label="Departamento"
                                value={departmentId || ''}
                                onChange={(e) => selectDepartment(Number(e.target.value))}
                                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                disabled={!form.country_id || isLoadingUbigeo}
                                required
                                error={errors.department_id}
                            />
                            <SelectField
                                name="province_id"
                                label="Provincia"
                                value={provinceId || ''}
                                onChange={(e) => selectProvince(Number(e.target.value))}
                                options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                                disabled={!departmentId || isLoadingUbigeo}
                                required
                                error={errors.province_id}
                            />
                            <SelectField
                                name="ubigeo_id"
                                label="Distrito"
                                value={form.ubigeo_id || ''}
                                onChange={(e) => selectDistrict(Number(e.target.value))}
                                options={districts.map((d) => ({ value: d.id, label: d.name }))}
                                disabled={!provinceId || isLoadingUbigeo}
                                required
                                error={errors.ubigeo_id}
                            />
                        </FormRow>
                        <FormRow>
                            <InputField name="latitude" label="Latitud (Opcional)" placeholder="-12.046374" value={form.latitude} onChange={(e) => setField('latitude')(e.target.value)} numberOnly allowNegative error={errors.latitude} />
                            <InputField name="longitude" label="Longitud (Opcional)" placeholder="-77.042793" value={form.longitude} onChange={(e) => setField('longitude')(e.target.value)} numberOnly allowNegative error={errors.longitude} />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Descripción">
                        <FormRow>
                            <TextAreaField name="description" label="Descripción (Opcional)" value={form.description} onChange={(e) => setField('description')(e.target.value)} />
                        </FormRow>
                    </FormSection>

                    <FormActions>
                        <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                        <Button
                            text={isEditMode ? 'Guardar' : 'Registrar sucursal'}
                            icon={UploadCloud}
                            size="lg"
                            type="submit"
                            loading={isSubmitting}
                        />
                    </FormActions>
                </form>
            )}
        </Modal>
    );
};

export default SucursalForm;
