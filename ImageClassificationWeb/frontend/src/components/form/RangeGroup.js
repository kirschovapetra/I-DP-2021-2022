import React, {useEffect, useState} from "react";
import {CContainer, CCol, CFormLabel, CFormRange, CRow, CFormSelect} from "@coreui/react"

/**
 * Group of Range form elements
 * @param rangeItems - input data for Range items
 * @param labelSize - label size
 * @param innerRef - reference to range
 * @returns {JSX.Element}
 * @constructor
 */
export const RangeGroup = ({rangeItems, labelSize = 3, innerRef}) => {
    return (
        <CContainer>
            {rangeItems.map(
                (item, key) => (
                    <CRow key={key}>
                        <CFormLabel htmlFor={item.id} className={`col-xxl-${labelSize} col-xl-${labelSize} col-lg-${labelSize} col-form-label text-center`}>
                            {item.label} : <b>{item.value}{item.labelSuffix}</b>
                        </CFormLabel>
                        <CCol>
                            {innerRef ? <CFormRange id={item.id} name={item.name} min={item.min} max={item.max} text={item.text}
                                               step={item.step} defaultValue={item.value} onChange={item.onChange} ref={innerRef}/>
                                : <CFormRange id={item.id} name={item.name} min={item.min} max={item.max} text={item.text}
                                              step={item.step} defaultValue={item.value} onChange={item.onChange}/>
                            }
                            <div className={'form-text text-end'} style={{marginTop: '-10px'}}>{item.text}</div>
                        </CCol>
                    </CRow>
                ))}
        </CContainer>
    );
}

