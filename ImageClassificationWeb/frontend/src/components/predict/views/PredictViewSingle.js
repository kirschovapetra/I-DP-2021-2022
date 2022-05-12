import {CCol, CRow} from "@coreui/react"
import React, {useEffect, useState} from "react"
import {UploadForm} from "../UploadForm"
import {ImagePreview} from "../ImagePreview"
import {PredictResults} from "../PredictResults"
import {createFormData, sendPredictRequest} from "../../../utils"
import {PreprocessingModal} from "../../preprocessing/PreprocessingModal"
import {cilBarChart, cilPencil} from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {ButtonWithIcon} from "../../form/ButtonWithIcon"
import i18n from "../../../translation/i18n";

/**
 * Core of predict view single
 * @param modelName - name of ML model for predictions
 * @param endpoint - endpoint for predictions
 * @param content - extension of form data (optional)
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const PredictViewSingle = ({modelName, endpoint, content = {}}) => {

    const [imageSrc, setImageSrc] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [editFileUrl, setEditFileUrl] = useState('')
    const [predList, setPredList] = useState(Array(10).fill(0))
    const [classList, setClassList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const [loadingPred, setLoadingPred] = useState(false)
    const [modalShow, setModalShow] = useState(false)
    const [imageSelected, setImageSelected] = useState(false)

    const dimInit = {height:250, width:250}
    const [dimensions, setDimensions] = useState(dimInit)

    useEffect(() => {
        let lang = localStorage.getItem("lang")
        localStorage.clear()
        localStorage.setItem("lang", lang)
    }, [])

    const mapPredictResults = (res, pred, classes) => {
        setPredList(pred)
        setClassList(classes)
    }

    useEffect(() => {
        localStorage.setItem('currentFileUrl', imageSrc)
        setFileUrl(imageSrc)
        setEditFileUrl(imageSrc)
        if (imageSrc !== "") setImageSelected(true)
    }, [imageSrc])

    const predict = async () => {
        const formData = createFormData({
            ...content,
            'image': fileUrl.toString(),
            'model_name': modelName
        })
        await sendPredictRequest(endpoint, formData, mapPredictResults, setLoadingPred)
    }

    return (
        <>
            <UploadForm setFileUrl={setImageSrc}/>
            <hr className={'mt-3'}/>
            <CRow>
                <CCol lg={5} className={'text-center'}>
                    <div className={"py-4"}>
                        <ImagePreview fileUrl={fileUrl} height={dimensions.height} width={dimensions.width} iconSize={40} setModalShow={setModalShow}/>
                    </div>
                    {imageSelected && <span className={'form-text'}>{i18n.t("constants.editHelp1")} <CIcon icon={cilPencil} size="lg"/> {i18n.t("constants.editHelp2")}</span>}
                </CCol>
                <CCol lg={7}>
                    <PredictResults predList={predList} classList={classList} loading={loadingPred} height={250} margin={20}/>
                </CCol>
            </CRow>
            <CRow className={"py-3"}>
                <CCol className={'text-center'}>
                    <ButtonWithIcon color="primary" className={'py-2 px-4 mx-1'}
                                    disabled={!imageSelected || loadingPred}
                                    onClick={predict} showSpinner={loadingPred}
                                    icon={cilBarChart} value={i18n.t("predict.predictButton")}/>
                </CCol>
            </CRow>

            <PreprocessingModal
                show={modalShow}
                onShow={()=>localStorage.setItem('currentFileUrl', fileUrl)}
                onHide={() => {
                    setModalShow(false)
                    setFileUrl(editFileUrl)
                    localStorage.setItem('currentFileUrl', editFileUrl)
                }}
                imageSrc={imageSrc}
                fileUrl={fileUrl}
                setFileUrl={setFileUrl}
                setEditFileUrl={setEditFileUrl}
                imageId={'currentFileUrl'}
                imageSize={dimensions}
                imageSizeOriginal={dimInit}
                updateDimensions={(newDim, objectId) => setDimensions(newDim)}
            />

        </>

    )
}