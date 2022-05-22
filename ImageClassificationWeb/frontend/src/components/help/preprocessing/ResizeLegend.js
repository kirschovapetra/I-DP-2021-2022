import React from "react";
import {CCol, CImage, CLink, CRow} from "@coreui/react";
import {capitalize} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for resize
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ResizeLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/preprocessing`

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start primary-text'}>{capitalize(i18n.t("help.resize"))} {i18n.t("help.image")}</h5>

                    <CRow className={'my-3'}>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.resizedTo"))} 50x50: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/resize1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/resize2.png`}/>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#resize'} target="_blank">react-imgpro:resize</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}