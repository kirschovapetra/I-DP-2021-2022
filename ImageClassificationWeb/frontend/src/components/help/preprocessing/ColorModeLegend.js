import React from "react";
import {CCol, CImage, CLink, CRow} from "@coreui/react";
import i18n from "i18next";
import {capitalize} from "../../../utils";

/***
 * Help modal content for color mode
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ColorModeLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/preprocessing`
    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol>
                    <h5 className={'text-start mb-3 primary-text'}>{capitalize(i18n.t("help.change"))} {i18n.t("help.color")}</h5>
                    <CRow>
                        <CCol lg={2}>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.greyscale"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/grey1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/grey2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>Sepia: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/sepia1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/sepia2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>Invert: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/invert1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/invert2.png`}/>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 ml-3 text-start'}>{i18n.t("help.customColor")}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/customColor1.png`}/>
                            <CImage thumbnail src={`${imagesRoot}/customColor2.png`}/>
                        </CCol>
                    </CRow>

                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                            <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#sepia'} target="_blank">react-imgpro: sepia</CLink></li>
                            <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#greyscale'} target="_blank">react-imgpro: greyscale</CLink></li>
                            <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#invert'} target="_blank">react-imgpro: invert</CLink></li>
                            <li><CLink href={'https://github.com/nitin42/react-imgpro/blob/master/Docs/Api.md#colors'} target="_blank">react-imgpro: custom colors</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}