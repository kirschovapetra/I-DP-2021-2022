import React from "react";
import {CCol, CImage, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for VGG19 model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const VGG19Help = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/models`

    return (
        <>
           <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{i18n.t("help.architecture")}</h5>
                    <CRow className={'mb-1 pb-2 overflow-auto'}>
                        <CCol><CImage src={`${imagesRoot}/vgg.svg`}/></CCol>
                    </CRow>

                    <CRow className={'mb-1'}>
                        <p className={'text-end'}><i>{i18n.t("help.generated")}{' '}
                            <CLink href={'https://netron.app/'} target="_blank">Netron</CLink></i></p>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://keras.io/api/applications/vgg/#vgg19-function'} target="_blank">keras-applications: vgg19</CLink></li>
                                <li><CLink href={'https://arxiv.org/abs/1409.1556'} target="_blank">Very Deep Convolutional Networks for Large-Scale Image Recognition</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}
