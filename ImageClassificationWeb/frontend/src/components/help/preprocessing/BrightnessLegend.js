import React from "react";
import {CCol, CImage, CLink, CRow} from "@coreui/react";
import i18n from "../../../translation/i18n";
import {capitalize} from "../../../utils";

/***
 * Help modal content for brightness
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const BrightnessLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/preprocessing`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{capitalize(i18n.t("help.change"))} {i18n.t("help.brightness")}</h5>
                    <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.range"))}: {i18n.t("help.from")} -1 {i18n.t("help.to")} 1</h6>
                    <CRow>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.brightness"))} {i18n.t("help.increased")}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/brightnessInc1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/brightnessInc2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.brightness"))} {i18n.t("help.decreased")}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/brightnessDec1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/brightnessDec2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#brightness'} target="_blank">react-imgpro:brightness</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}