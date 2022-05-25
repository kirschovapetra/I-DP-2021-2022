import React, {useEffect, useState} from "react";
import {ML, ML_METHOD, MODELS, MODELS_STACKING} from "../../../utils";
import {capitalize, formatMessage, sendGetRequest} from "../../../utils";
import {DropdownGroup} from "../../form/DropdownGroup";
import {CCol, CRow} from "@coreui/react";
import i18n from "../../../translation/i18n";
import CnnBoosting from "./CnnBoosting";

/***
 * Stacking model view
 * @param setModelName - model name setter
 * @param colWidth - width of form column
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const Stacking = ({setModelName, colWidth = 6}) => {
    const dropdown1Init = {
        id: `${ML.MODEL}_1`,
        name: `${ML.MODEL}_1`,
        label: capitalize(`${ML.MODEL}_1`),
        value: '',
        onChange: (e) => {
            setModels1Dropdown(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        },
        options: [{value: ''}].concat(MODELS_STACKING.map(mdl => ({value: mdl})))
    }

    const dropdown2Init = {
        id: `${ML.MODEL}_2`,
        name: `${ML.MODEL}_2`,
        label: capitalize(`${ML.MODEL}_2`),
        value: '',
        onChange: (e) => {
            setModels2Dropdown(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        },
        options: [{value: ''}].concat(MODELS_STACKING.map(mdl => ({value: mdl})))
    }

    const dropdown3Init = {
        id: `${ML.MODEL}_3`,
        name: `${ML.MODEL}_3`,
        label: capitalize(`${ML.MODEL}_3`),
        text: formatMessage('Stacking', true, i18n),
        value: '',
        onChange: (e) => {
            setModels3Dropdown(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        },
        options: [{value: ''}].concat(MODELS_STACKING.map(mdl => ({value: mdl})))
    }

    const [models1Dropdown, setModels1Dropdown] = useState(dropdown1Init)
    const [models2Dropdown, setModels2Dropdown] = useState(dropdown2Init)
    const [models3Dropdown, setModels3Dropdown] = useState(dropdown3Init)

    useEffect(() => {
        let values = [models1Dropdown, models2Dropdown, models3Dropdown].map(itm => itm.value).filter(itm => itm.length > 0)
        if (values.length > 0) setModelName(values.join('_'))
    }, [models1Dropdown, models2Dropdown, models3Dropdown])


    return (
        <CRow className="my-3">
            <CCol lg={colWidth} className='mx-auto text-end'>
                <DropdownGroup dropdownItems={[models1Dropdown, models2Dropdown, models3Dropdown]}/>
            </CCol>
        </CRow>
    )
}
export default Stacking