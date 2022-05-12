import React from "react";
import {CCol, CImage, CRow, CLink} from "@coreui/react";
import {capitalize} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for normalization
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const NormalizeLegend = () => {

    const imagesRoot = '../../../../../static/images/help/preprocessing'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>
                        {capitalize(i18n.t("help.normalize"))}
                    </h5>

                    <CRow className={'my-3'}>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.normalized"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/normalize1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/normalize2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                         <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#normalize'} target="_blank">react-imgpro:normalize</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}