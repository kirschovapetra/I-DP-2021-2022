import React from "react";
import {CCallout, CCol, CImage, CLink, CRow} from "@coreui/react";
import {ML_METHOD} from "../../../utils";
import {capitalize} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for rotation
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const RotationLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/preprocessing`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{capitalize(i18n.t("help.rotate"))} {i18n.t("help.image")}</h5>
                    <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.range"))}: {i18n.t("help.from")} -360° {i18n.t("help.to")} 360°</h6>

                    <CRow className={'my-3'}>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.rotated"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/rotation1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/rotation2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#rotate'} target="_blank">react-imgpro:rotate</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}