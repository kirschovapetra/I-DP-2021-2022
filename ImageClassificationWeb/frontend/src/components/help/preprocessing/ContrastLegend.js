import React from "react";
import {CCol, CImage, CLink, CRow} from "@coreui/react";
import i18n from "i18next";
import {capitalize} from "../../../utils";

/***
 * Help modal content for contrast
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ContrastLegend = () => {

    const imagesRoot = '../../../../../static/images/help/preprocessing'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{capitalize(i18n.t("help.change"))} {i18n.t("help.contrast")}</h5>
                    <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.range"))}: {i18n.t("help.from")} -1 {i18n.t("help.to")} 1</h6>
                    <CRow>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.contrast"))} {i18n.t("help.increased")}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/contrastInc1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/contrastInc2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.contrast"))} {i18n.t("help.decreased")}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/contrastDec1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/contrastDec2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#contrast'} target="_blank">react-imgpro:contrast</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}