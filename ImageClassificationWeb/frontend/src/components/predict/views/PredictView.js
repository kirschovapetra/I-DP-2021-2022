import React, {useState} from "react";
import {useParams} from "react-router-dom";
import {ENDPOINT, initView, ML_METHOD} from "../../../utils";
import {CCard, CCardBody, CCardHeader, CRow} from "@coreui/react";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";

const CnnBoosting = React.lazy(() => import('./CnnBoosting'))
const Stacking = React.lazy(() => import('./Stacking'))
const TwoStep = React.lazy(() => import('./TwoStep'))
const Bagging = React.lazy(() => import('./Bagging'))

/**
 * Component displaying and handling predictions
 * @param predictView - predict view (single/crop/draw)
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const PredictView = ({predictView}) => {
    const {method} = useParams()
    const [modelName, setModelName] = useState('')
    const [content, setContent] = useState()

    const getInit = () => {
        switch (method) {
            case ML_METHOD.CNN:
                return initView(predictView, method, modelName.toLowerCase(), ENDPOINT.PREDICT_CNN, ENDPOINT.MULTIPREDICT_CNN)
            case ML_METHOD.BAGGING:
                return initView(predictView, method, modelName.toLowerCase(), ENDPOINT.PREDICT_BAGGING, ENDPOINT.MULTIPREDICT_BAGGING, content)
            case ML_METHOD.BOOSTING:
                return initView(predictView, method, modelName.toLowerCase(), ENDPOINT.PREDICT_BOOSTING, ENDPOINT.MULTIPREDICT_BOOSTING)
            case ML_METHOD.STACKING:
                return initView(predictView, method, modelName.toLowerCase(), ENDPOINT.PREDICT_STACKING, ENDPOINT.MULTIPREDICT_STACKING)
            case ML_METHOD.TWO_STEP:
                return initView(predictView, method, modelName.toLowerCase(), ENDPOINT.PREDICT_TWO_STEP, ENDPOINT.MULTIPREDICT_TWO_STEP, content)
        }
    }

    return (
        <>
            <CRow className={'pb-4'}>
                <CCard className={'p-0'}>
                    <CCardHeader className={'pt-2 pb-1 justify-content-end text-end'}>
                        <HelpIconTooltip title={getInit().title} content={getInit().helpContent} modalSize={'xl'}/>
                    </CCardHeader>
                    <CCardBody>
                        {
                            method === ML_METHOD.CNN ? <CnnBoosting setModelName={setModelName} method={method} helpMethod={"CNN"}/> :
                                method === ML_METHOD.BAGGING ? <Bagging setModelName={setModelName} setContent={setContent}/> :
                                    method === ML_METHOD.BOOSTING ? <CnnBoosting setModelName={setModelName} method={method} helpMethod={"Boosting"}/> :
                                        method === ML_METHOD.STACKING ? <Stacking setModelName={setModelName}/> :
                                            method === ML_METHOD.TWO_STEP ? <TwoStep setModelName={setModelName} setContent={setContent}/> :
                                                ''
                        }
                        {getInit().view}
                    </CCardBody>
                </CCard>
            </CRow>
        </>
    );
}
export default PredictView
