import type { FormEvent } from 'react';
import { Building2, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { FormActions } from '../../../shared/components';
import CompanyStepForm from './CompanyStepForm';
import type { CompanyStepForm as CompanyStepFormData } from '../interfaces/companyRegistration.interface';
import type { UbigeoNode } from '../../system/interfaces/catalog.interface';

interface CompanyEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    form: CompanyStepFormData;
    setField: (name: keyof CompanyStepFormData) => (value: string | number | boolean) => void;
    countryOptions: { value: number; label: string }[];
    departments: UbigeoNode[];
    provinces: UbigeoNode[];
    districts: UbigeoNode[];
    departmentId: number;
    provinceId: number;
    selectCompanyCountry: (countryId: number) => void;
    selectDepartment: (id: number) => void;
    selectProvince: (id: number) => void;
    selectDistrict: (id: number) => void;
    isLoadingUbigeo: boolean;
    isSaving?: boolean;
}

/** Modal de edición de la propia empresa — reusa CompanyStepForm, incluido el documento (RUC), por si se cargó mal al registrar. */
export const CompanyEdit = ({
    isOpen, onClose, onSubmit, form, setField, countryOptions,
    departments, provinces, districts, departmentId, provinceId,
    selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
    isSaving = false,
}: CompanyEditProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar empresa" icon={Building2} size="lg">
        <form onSubmit={onSubmit}>
            <CompanyStepForm
                form={form}
                setField={setField}
                countryOptions={countryOptions}
                departments={departments}
                provinces={provinces}
                districts={districts}
                departmentId={departmentId}
                provinceId={provinceId}
                selectCompanyCountry={selectCompanyCountry}
                selectDepartment={selectDepartment}
                selectProvince={selectProvince}
                selectDistrict={selectDistrict}
                isLoadingUbigeo={isLoadingUbigeo}
            />

            <FormActions>
                <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default CompanyEdit;
