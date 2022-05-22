import React from "react";
import {CCol, CImage, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for custom model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CustomHelp = () => {

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

                        {i18n.t("help.docu")}:<br/>
                        <ul>
                            <li><CLink href={'https://keras.io/guides/sequential_model/'} target="_blank">keras: The Sequential model</CLink></li>
                        </ul>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}