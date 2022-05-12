import {CFormInput, CFormLabel, CCol, CContainer, CRow, CFormSelect} from "@coreui/react";
import React from "react";

/**
 * Group of Input form elements
 * @param inputs - input data for Input items
 * @param labelSize - label size
 * @constructor
 * @component
 */
export const InputGroup = ({inputs, labelSize=3}) => {
    return (
        <CContainer>
            {
                inputs.map(
                    (item, key) => (
                        <CRow key={key}>
                            <CFormLabel htmlFor={item.id} className={`col-xxl-${labelSize} col-xl-${labelSize} col-lg-${labelSize} col-form-label text-center`}>{item.label}</CFormLabel>
                            <CCol>
                                <CFormInput type={item.type} id={item.id} name={item.name} min={item.min} placeholder={item.placeholder}
                                            max={item.max} defaultValue={item.value} onChange={item.onChange} size={"sm"}/>
                            </CCol>
                        </CRow>
                    ))}
        </CContainer>
    )
}