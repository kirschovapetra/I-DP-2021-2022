import React, {useState} from "react";
import {CCol, CRow} from '@coreui/react';
import {createFormData, sendPredictRequest} from "../../../utils";
import {PredictResults} from "../PredictResults";
import {cilBarChart} from "@coreui/icons";
import {CanvasDrawPreview} from "../CanvasDrawPreview";
import {ButtonWithIcon} from "../../form/ButtonWithIcon";
import i18n from "../../../translation/i18n";

/**
 * Core of predict view draw
 * @param modelName - name of ML model for predictions
 * @param endpoint - endpoint for predictions
 * @param content - extension of form data (optional)
 * @returns {JSX.Element}
 * @constructor
 * @component
 */

export const PredictViewDraw = ({modelName, endpoint, content = {}}) => {

    const [dataUrl, setDataUrl] = useState('')
    const [predList, setPredList] = useState(Array(10).fill(0))
    const [classList, setClassList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const [loadingPred, setLoadingPred] = useState(false)

    const mapPredictResults = (res, pred, classes) => {
        setPredList(pred)
        setClassList(classes)
    }

    const predict = () => {
        const formData = createFormData({
            ...content,
            'image': dataUrl.toString(),
            'model_name': modelName
        })
        sendPredictRequest(endpoint, formData, mapPredictResults, setLoadingPred).then()
    }

    return (
        <>
            <hr className={'mt-3'}/>
            <CRow>
                <CCol lg={6}>
                    <CanvasDrawPreview dataUrl={dataUrl} changeDataUrl={(newVal) => setDataUrl(newVal)}/>
                </CCol>

                <CCol lg={6}>
                    <PredictResults predList={predList} classList={classList} loading={loadingPred} height={250} margin={20}/>
                </CCol>
            </CRow>
            <CRow>
                <CCol className={'text-center'}>
                    <ButtonWithIcon color="primary" className={'py-2 px-4 mx-1'}
                                    disabled={loadingPred} onClick={predict}
                                    showSpinner={loadingPred} icon={cilBarChart}
                                    value={i18n.t("predict.predictButton")}/>
                </CCol>
            </CRow>
        </>
    );
}