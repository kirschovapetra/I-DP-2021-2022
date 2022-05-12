import {CCol, CContainer, CFormLabel, CFormSelect, CRow} from "@coreui/react";
import React from "react";
import CIcon from "@coreui/icons-react";


/**
 * Group of Select form elements
 * @param dropdownItems - input data for dropdown items
 * @param labelSize - label size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const DropdownGroup = ({dropdownItems, labelSize=3}) => {
    return (
        <CContainer>
            {dropdownItems.map(
                (item, key) => (
                    <CRow key={key}>
                        <CFormLabel htmlFor={item.id} className={`col-xxl-${labelSize} col-xl-${labelSize} col-lg-${labelSize} col-form-label text-center`}>{item.label}</CFormLabel>
                        <CCol>
                            <CFormSelect id={item.id} name={item.name} defaultValue={item.value} onChange={item.onChange} text={item.text} size={'sm'}>
                                {item.options.map(
                                    (option, key) => (<option key={key} value={option.value}>{option.value}</option>)
                                )}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                ))}
        </CContainer>
    )
}