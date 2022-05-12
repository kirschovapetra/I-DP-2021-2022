import React from "react";
import {CCol, CImage, CRow} from '@coreui/react'
import {ML_METHOD} from "../../utils";
import i18n from "../../translation/i18n";

/***
 * Help page for predict draw
 * @param method - predict method
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const DrawHelp = ({method}) => {

    const imagesRoot = '../../../../static/images/help'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.selectModel")}{[ML_METHOD.STACKING, ML_METHOD.TWO_STEP].includes(method) && i18n.t("pl")}</h5>
                    <CRow>
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
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.draw")}</h5>
                    <CRow>
                        <CCol lg={8}>
                            <CImage thumbnail src={`${imagesRoot}/draw/canvasComplete.png`}/>
                        </CCol>
                    </CRow>
                    <hr/>
                    <h5 className={'mb-3 text-start primary-text'}>{i18n.t("help.filters")}</h5>
                    <CRow>
                        <CCol lg={7}>
                            <CRow>
                                <h6 className={'mb-2 text-start'}>{i18n.t("help.original")}: </h6>
                                <CImage thumbnail src={`${imagesRoot}/draw/filtersOriginal.png`}/>
                            </CRow>
                            <CRow>
                                <h6 className={'my-2 text-start'}>{i18n.t("help.blur")}: </h6>
                                <CImage thumbnail src={`${imagesRoot}/draw/filtersBlur.png`}/>
                            </CRow>
                            <CRow>
                                <h6 className={'my-2 text-start'}>{i18n.t("help.noise")}: </h6>
                                <CImage thumbnail src={`${imagesRoot}/draw/filtersNoise.png`}/>
                            </CRow>
                        </CCol>
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