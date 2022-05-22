import React from "react";
import {CCol, CImage, CRow} from '@coreui/react'
import {ML_METHOD} from "../../utils";
import i18n from "../../translation/i18n";
import {CanvasControlsCallout} from "./CanvasControlsCallout";

/***
 * Help page for predict crop
 * @param method - predict method
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CropHelp = ({method}) => {

    const imagesRoot = i18n.t("helpImgPath")

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.selectModel")}{[ML_METHOD.STACKING, ML_METHOD.TWO_STEP].includes(method) && i18n.t("pl")}</h5>
                    <CRow>
                        {
                            method === ML_METHOD.TWO_STEP ?
                                <>
                                    <CCol>
                                        <h6 className={'text-center'}>{i18n.t("help.primary")}</h6>
                                        <CImage thumbnail src={`${imagesRoot}/primModel.png`}/>
                                    </CCol>
                                    <CCol>
                                        <h6 className={'text-center'}>{i18n.t("help.secondary")}</h6>
                                        <CImage thumbnail src={`${imagesRoot}/secModel.png`}/>
                                    </CCol>
                                </>
                                : <CCol lg={8}>
                                    <CImage thumbnail src={`${imagesRoot}/${method === ML_METHOD.STACKING ? 'stacking' : ''}models.png`}/>
                                </CCol>
                        }
                    </CRow>
                    <hr/>
                    {
                        method === ML_METHOD.BAGGING &&
                        <>
                            <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.estimators")}</h5>
                            <CRow>
                                <CCol lg={8}>
                                    <CImage thumbnail src={`${imagesRoot}/estimators.png`}/>
                                </CCol>
                            </CRow>
                            <hr/>
                        </>
                    }

                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.uploadMulti")}</h5>
                    <CRow>
                        <CCol lg={8}>
                            <CImage thumbnail src={`${imagesRoot}/upload.png`}/>
                        </CCol>
                    </CRow>
                    <hr/>
                    <CRow>
                        <CCol>
                            <h5 className={'mb-3 text-start'}>{i18n.t("help.controls")}: </h5>
                            <CanvasControlsCallout/>
                        </CCol>
                        <CCol lg={5}>
                            <h5 className={'mb-3 ml-3 text-start justify-content-start'}>{i18n.t("help.zoom")}: </h5>
                            <CImage thumbnail src={`${imagesRoot}/crop/zoom.png`}/>
                        </CCol>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.boxes")}:</h5>
                    <CRow className={'justify-content-start mx-auto text-center'}>
                        <CImage thumbnail src={`${imagesRoot}/crop/beforePredict.png`}/>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.predictMulti")}</h5>
                    <CRow className={'justify-content-start mx-auto text-center'}>
                        <CImage thumbnail src={`${imagesRoot}/crop/afterPredict.png`}/>
                    </CRow>
                    <hr/>
                </CCol>
            </CRow>
        </>
    )
}