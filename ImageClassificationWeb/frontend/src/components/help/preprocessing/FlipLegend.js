import React from "react";
import {CCol, CImage, CLink, CRow} from "@coreui/react";
import {capitalize} from "../../../utils";
import i18n from "i18next";

/***
 * Help modal content for flip
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const FlipLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/preprocessing`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start mb-3 primary-text'}>{capitalize(i18n.t("help.flip"))} {i18n.t("help.image")}</h5>
                    <CRow>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.horizontalFlip"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/horiz1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/horiz2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.verticalFlip"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/vert1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/vert2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#flip'} target="_blank">react-imgpro:flip</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}