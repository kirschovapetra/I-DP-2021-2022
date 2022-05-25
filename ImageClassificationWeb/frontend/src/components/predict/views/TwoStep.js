import React, {useEffect, useState} from "react";
import {CCol, CRow} from "@coreui/react";
import {ML_METHOD, MODELS} from "../../../utils";
import {capitalize, sendGetRequest} from "../../../utils";
import {CheckGroup} from "../../form/CheckGroup";
import {ModelsDropdown} from "../../form/ModelsDropdown";
import i18n from "../../../translation/i18n";

const CnnBoosting = React.lazy(() => import('./CnnBoosting'))
const Stacking = React.lazy(() => import('./Stacking'))
const Bagging = React.lazy(() => import('./Bagging'))


/***
 * Two-step model view
 * @param setModelName - model name setter
 * @param setContent - post request body setter
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const TwoStep = ({setModelName, setContent}) => {
    // const [models, setModels] = useState([])
    // const [changed, setChanged] = useState()
    // useEffect(() => sendGetRequest(`/models/${ML_METHOD.TWO_STEP}`, setModels).then(), [])
    // useEffect(() => setChanged(Date.now()), [models]);

    const modelsRadioItemsInit = [
        {
            name: "model_type",
            value: ML_METHOD.CNN,
            id: ML_METHOD.CNN,
            checked: true,
            label: capitalize(ML_METHOD.CNN),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "model_type",
            value: ML_METHOD.BAGGING,
            id: ML_METHOD.BAGGING,
            checked: false,
            label: capitalize(ML_METHOD.BAGGING),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "model_type",
            value: ML_METHOD.BOOSTING,
            id: ML_METHOD.BOOSTING,
            checked: false,
            label: capitalize(ML_METHOD.BOOSTING),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "model_type",
            value: ML_METHOD.STACKING,
            id: ML_METHOD.STACKING,
            checked: false,
            label: capitalize(ML_METHOD.STACKING),
            onChange: (e) => setSelected(e.target.id)
        },
    ]

    const [modelsRadioItems, setModelsRadioItems] = useState(modelsRadioItemsInit)
    const [primaryModelName, setPrimaryModelName] = useState('')
    const [baggingContent, setBaggingContent] = useState()
    const [selected, setSelected] = useState(ML_METHOD.CNN)

    useEffect(() => {
        setModelsRadioItems(
            modelsRadioItems.map(
                (item) => ({...item, checked: item.id === selected})
            )
        )
    }, [selected]);

    useEffect(() => {
        let newContent = {
            'primary_name': primaryModelName,
            'primary_method': selected
        }
        if (selected === ML_METHOD.BAGGING)
            newContent = {...newContent, ...baggingContent}
        setContent(newContent)
    }, [baggingContent, selected, primaryModelName])

    const props = {
        setModelName: setPrimaryModelName,
        colWidth: 12
    }

    return (
        <CRow className="my-3 text-center justify-content-center">
            <CCol lg={5}>
                <h5 className={'mb-2'}>{i18n.t("help.primary")}</h5>
                <CheckGroup type="radio" radioItems={modelsRadioItems} direction={"horizontal"}/>
                {
                    selected === ML_METHOD.CNN ? <CnnBoosting {...props} method={selected} helpMethod={"CNN"}/> :
                        selected === ML_METHOD.BAGGING ? <Bagging {...props} setContent={setBaggingContent}/> :
                            selected === ML_METHOD.BOOSTING ? <CnnBoosting {...props} method={selected} helpMethod={"Boosting"}/> :
                                selected === ML_METHOD.STACKING ? <Stacking {...props}/> :
                                    ''
                }
            </CCol>
            <CCol lg={5} className={'text-end'}>
                <h5 className={'mb-2 text-center'}>{i18n.t("help.secondary")}</h5>
                <ModelsDropdown models={MODELS} helpMethod={`${i18n.t("help.secondaryOnly")} CNN`} setModelName={setModelName}/>
            </CCol>
        </CRow>
    )
}
export default TwoStep