import { Modal } from "../../../shared/components"
import type { BussinesHourProps } from "../interfaces/bussinesHour.interfece"

const BusinessHour = ({ isOpen, onClose }: BussinesHourProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Administra Horarios y Precios">
            <div>
                <h2>Horarios y precios</h2>
            </div>
        </Modal>
    )
}

export default BusinessHour;