import React, {useEffect, useState} from "react";
import {capitalize, formatMessage, ML, ML_METHOD, sendGetRequest} from "../../../utils";
import {InputMixGroup} from "../../form/InputMixGroup";
import {CCol, CRow} from "@coreui/react";
import i18n from "../../../translation/i18n";

/***
 * Bagging model view
 * @param setModelName - model name setter
 * @param setContent - post request body setter
 * @param colWidth - width of form column
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const Bagging = ({setModelName, setContent, colWidth = 6}) => {

    const [models, setModels] = useState([])
    useEffect(() => sendGetRequest(`/models/${ML_METHOD.BAGGING}`, setModels).then(), [])
    useEffect(() => {
        setModelsDropdown(
            {
                ...modelsDropdown,
                value: models[0]?.title || '',
                options: models.map(mdl => ({value: mdl.title}))
            }
        )
    }, [models]);


    const modelsInit = {
        id: ML.MODEL,
        name: ML.MODEL,
        label: capitalize(ML.MODEL),
        text: formatMessage('Bagging', false, i18n),
        value: models[0]?.title || '',
        onChange: (e) => {
            setModelsDropdown(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        },
        options: models.map(
            (mdl) => ({value: mdl.title})
        )
    }

    const estimatorsInit = {
        id: ML.N_ESTIMATORS,
        name: ML.N_ESTIMATORS,
        value: 2,
        step: 1,
        min: 2,
        max: 4,
        placeholder: `${i18n.t("predict.from")} 2 ${i18n.t("help.to")} 4`,
        label: i18n.t("predict.numOfExtimators"),
        onChange: (e) => {
            setEstimatorsRange(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        }
    }


    const [modelsDropdown, setModelsDropdown] = useState(modelsInit)
    const [estimatorsRange, setEstimatorsRange] = useState(estimatorsInit)
    useEffect(() => setModelName(modelsDropdown.value.toLowerCase()), [modelsDropdown])
    useEffect(() => setContent({'n_estimators': estimatorsRange.value}), [estimatorsRange])

    return (
        <CRow className="my-3">
            <CCol lg={colWidth} className='mx-auto text-end'>
                <InputMixGroup selects={[modelsDropdown]} ranges={[estimatorsRange]}/>
            </CCol>
        </CRow>

    )
}
export default Bagging