import React from "react";
import {CCol, CImage, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for two-step model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const TwoStepHelp = () => {

    const imagesRoot = '../../../../../static/images/help/models'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{i18n.t("help.architecture")}</h5>
                    <CRow className={'mb-1 pb-2'}>
                        <CImage src={`${imagesRoot}/2step_classifier.png`}/>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}