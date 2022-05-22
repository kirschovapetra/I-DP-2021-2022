import React from "react";
import {CCol, CImage, CContainer, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for InceptionV3 model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const InceptionV3Help = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/models`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{i18n.t("help.architecture")}</h5>
                     <CRow className={'mb-1 pb-2 overflow-auto'}>
                        <CCol><CImage src={`${imagesRoot}/inception.svg`}/></CCol>
                    </CRow>

                    <CRow className={'mb-1'}>
                        <p className={'text-end'}><i>{i18n.t("help.generated")}{' '}
                            <CLink href={'https://netron.app/'} target="_blank">Netron</CLink></i></p>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://keras.io/api/applications/inceptionv3/'} target="_blank">keras-applications: InceptionV3</CLink></li>
                                <li><CLink href={'https://arxiv.org/abs/1512.00567'} target="_blank">Rethinking the Inception Architecture for Computer Vision</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}