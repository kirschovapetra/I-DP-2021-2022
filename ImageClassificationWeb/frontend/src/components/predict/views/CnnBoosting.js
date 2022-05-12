import React, {useEffect, useState} from "react";
import {CCol, CRow} from "@coreui/react";
import {sendGetRequest} from "../../../utils";
import {ModelsDropdown} from "../../form/ModelsDropdown";

/***
 * CNN and Boosting model view
 * @param setModelName - model name setter
 * @param colWidth - width of form column
 * @param method - method (CNN or boosting)
 * @param helpMethod - method name used in help text
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const CnnBoosting = ({setModelName,colWidth= 6, method, helpMethod}) => {
    const [models, setModels] = useState([])
    const [changed, setChanged] = useState()
    useEffect(() => sendGetRequest(`/models/${method}`, setModels).then(), [])
    useEffect(() => setChanged(Date.now()), [models]);
    return (
        <CRow className="my-3" key={changed}>
            <CCol lg={colWidth} className='mx-auto text-end'>
                <ModelsDropdown models={models} helpMethod={helpMethod} setModelName={setModelName}/>
            </CCol>
        </CRow>
    )
}
export default CnnBoosting