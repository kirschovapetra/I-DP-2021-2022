import React from "react";
import {CCol, CImage, CRow} from '@coreui/react'
import {ML_METHOD} from "../../utils";
import i18n from "../../translation/i18n";

/***
 * Help page for predict single
 * @param method - predict method
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const SingleHelp = ({method}) => {

    const imagesRoot = '../../../../static/images/help'

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
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.uploadSingle")}</h5>
                    <CRow>
                        <CCol lg={8}>
                            <CRow><CImage thumbnail src={`${imagesRoot}/upload.png`}/></CRow>
                            <CRow className={'col-lg-5'}><CImage thumbnail src={`${imagesRoot}/single/image.png`}/></CRow>
                        </CCol>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.edit")}</h5>
                    <CRow>
                        <CImage thumbnail src={`${imagesRoot}/single/preprocessing.png`}/>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.predict")}</h5>
                    <CRow className={'justify-content-start mx-auto text-center'}>
                        <CCol><CImage thumbnail src={`${imagesRoot}/predictButton.png`}/></CCol>
                        <CCol lg={7}><CImage thumbnail src={`${imagesRoot}/5chart.png`}/></CCol>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.threshold")}</h5>
                    <CRow className={'justify-content-start mx-auto'}>
                        <CCol><CImage thumbnail src={`${imagesRoot}/3chartThresholdMiddle.png`}/></CCol>
                        <CCol><CImage thumbnail src={`${imagesRoot}/3chartThresholdDown.png`}/></CCol>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}