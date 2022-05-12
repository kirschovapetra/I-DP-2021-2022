import React from "react";
import {CCol, CImage, CLink, CRow} from '@coreui/react'
import {ML_METHOD} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for ResNext50 model
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ResNeXt50Help = () => {

    const imagesRoot = '../../../../../static/images/help/models'

    return (
        <>
           <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{i18n.t("help.architecture")}</h5>
                    <CRow className={'mb-1 pb-2 overflow-auto'}>
                        <CCol><CImage src={`${imagesRoot}/resnext50.svg`}/></CCol>
                    </CRow>

                    <CRow className={'mb-1'}>
                        <p className={'text-end'}><i>{i18n.t("help.generated")}{' '}
                            <CLink href={'https://netron.app/'} target="_blank">Netron</CLink></i></p>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/leondgarse/keras_cv_attention_models#resnext'} target="_blank">keras_cv_attention_models: ResNeXt</CLink></li>
                                <li><CLink href={'https://arxiv.org/pdf/1611.05431.pdf'} target="_blank">Aggregated Residual Transformations for Deep Neural Networks</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}