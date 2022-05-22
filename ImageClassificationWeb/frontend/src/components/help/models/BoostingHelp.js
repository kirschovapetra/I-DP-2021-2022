import React from "react";
import {CCol, CImage, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for boosting model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const BoostingHelp = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/models`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text mb-2'}>{i18n.t("help.architecture")}</h5>
                    <CRow className={'mb-1 py-2'}>
                        <CImage src={`${imagesRoot}/boosting.png`} className={'col-lg-11'}/>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>

                        {i18n.t("help.docu")}:<br/>
                        <ul>
                            <li><CLink href={'https://xgboost.readthedocs.io/en/stable/'} target="_blank">XGBoost</CLink></li>
                        </ul>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}