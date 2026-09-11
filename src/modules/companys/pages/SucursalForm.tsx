import { Store, MapPin, UploadCloud, X } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, TextAreaField, FormSection, FormRow, FormActions, ForbiddenScreen, NotFoundScreen, LoadingScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import useSucursalForm from '../hooks/useSucursalForm';
import '../styles/SucursalForm.css';

// Alta y edición de sucursal — una sola página para los dos modos (ver useSucursalForm). El
// título/subtítulo cambian según el modo, el resto del formulario es idéntico.
const SucursalForm = () => {
    const canManage = usePermission('sucursal.manage');
    const {
        isEditMode, isLoading, isSubmitting, parentError,
        companyTenantId, companyName,
        form, setField, isFormValid,
        countryOptions, departments, provinces, districts, departmentId, provinceId,
        selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        handleSubmit, goBack,
    } = useSucursalForm();

    if (!canManage) {
        return <ForbiddenScreen />;
    }

    if (isLoading) {
        return <LoadingScreen message="Cargando sucursal..." size="lg" />;
    }

    // Solo se da en alta: la empresa del tenantId de la URL no existe o no es accesible — mejor
    // esto que dejar completar un form que va a fallar seguro al enviar (ver useSucursalForm).
    if (parentError === 'not_found') {
        return <NotFoundScreen message="La empresa que buscás no existe." />;
    }

    if (parentError === 'forbidden') {
        return <ForbiddenScreen message="No tenés acceso a esta empresa." />;
    }

    if (parentError === 'unknown') {
        return <NotFoundScreen title="Ocurrió un error" message="No se pudo cargar la empresa." />;
    }

    return (
        <div className="sucursal_form_page">
            <Header
                title={isEditMode ? 'Editar sucursal' : 'Nueva sucursal'}
                subtitle={isEditMode ? 'Actualizá los datos de la sucursal' : 'Registrá una nueva sucursal para esta empresa'}
                icon={Store}
                breadcrumbs={[
                    { label: 'Empresas', path: '/companys' },
                    ...(companyName ? [{ label: companyName, path: `/companys/company/${companyTenantId}` }] : []),
                ]}
            />

            <div className="card sucursal_form_card">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Información general" icon={Store}>
                        <FormRow>
                            <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                            <InputField name="phone_cell" label="Teléfono celular" value={form.phone_cell} onChange={(e) => setField('phone_cell')(e.target.value)} required />
                        </FormRow>
                        <FormRow>
                            <InputField name="phone" label="Teléfono fijo" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Ubicación" icon={MapPin}>
                        <FormRow>
                            <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => selectCountry(Number(e.target.value))} options={countryOptions} required />
                            <SelectField
                                name="department_id"
                                label="Departamento"
                                value={departmentId || ''}
                                onChange={(e) => selectDepartment(Number(e.target.value))}
                                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                disabled={!form.country_id || isLoadingUbigeo}
                                required
                            />
                        </FormRow>
                        <FormRow>
                            <SelectField
                                name="province_id"
                                label="Provincia"
                                value={provinceId || ''}
                                onChange={(e) => selectProvince(Number(e.target.value))}
                                options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                                disabled={!departmentId || isLoadingUbigeo}
                                required
                            />
                            <SelectField
                                name="ubigeo_id"
                                label="Distrito"
                                value={form.ubigeo_id || ''}
                                onChange={(e) => selectDistrict(Number(e.target.value))}
                                options={districts.map((d) => ({ value: d.id, label: d.name }))}
                                disabled={!provinceId || isLoadingUbigeo}
                                required
                            />
                        </FormRow>
                        <FormRow>
                            <InputField name="address" label="Dirección" value={form.address} onChange={(e) => setField('address')(e.target.value)} required />
                        </FormRow>
                        <FormRow>
                            <InputField name="latitude" label="Latitud" value={form.latitude} onChange={(e) => setField('latitude')(e.target.value)} />
                            <InputField name="longitude" label="Longitud" value={form.longitude} onChange={(e) => setField('longitude')(e.target.value)} />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Descripción">
                        <FormRow>
                            <TextAreaField name="description" label="Descripción" value={form.description} onChange={(e) => setField('description')(e.target.value)} />
                        </FormRow>
                    </FormSection>

                    <FormActions>
                        <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={goBack} />
                        <Button
                            text={isEditMode ? 'Guardar' : 'Registrar sucursal'}
                            icon={UploadCloud}
                            size="lg"
                            type="submit"
                            loading={isSubmitting}
                            disabled={!isFormValid}
                        />
                    </FormActions>
                </form>
            </div>
        </div>
    );
};

export default SucursalForm;
