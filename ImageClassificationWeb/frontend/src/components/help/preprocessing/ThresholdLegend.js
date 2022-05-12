import React from "react";
import {CCallout, CCol, CImage, CLink, CRow} from "@coreui/react";
import {capitalize} from "../../../utils";
import i18n from "../../../translation/i18n";

/***
 * Help modal content for threshold
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ThresholdLegend = () => {

    const imagesRoot = '../../../../../static/images/help/preprocessing'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start mb-3 primary-text'}>{i18n.t("help.thresholdAlg")}</h5>
                    <CRow>
                        <CCol lg={3}>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/original.png`}/>
                        </CCol>
                        <CCol className={'justify-content-start'}>
                            <h6 className={'ml-3 mb-3 text-start '}>Otsu thresholding: </h6>
                            <CRow>
                                <CCol><CImage className={'mb-1'} thumbnail src={`${imagesRoot}/thresholdOtsu1.png`}/></CCol>
                                <CCol><CImage thumbnail src={`${imagesRoot}/thresholdOtsu2.png`}/></CCol>
                            </CRow>
                        </CCol>
                    </CRow>

                    <CRow>
                        <CCol>
                            <h6 className={'ml-3 my-3 text-start'}>Adaptive (local) thresholding: </h6>
                            <CRow className={'justify-content-start'}>
                                <CCol><CImage className={'mb-1'} thumbnail src={`${imagesRoot}/thresholdAdaptive1.png`}/></CCol>
                                <CCol><CImage thumbnail src={`${imagesRoot}/thresholdAdaptive2.png`}/></CCol>
                            </CRow>
                            <CRow>
                                <CCallout color="primary">
                                    <ul className={'text-start'} style={{fontWeight:'normal'}}>
                                        <li><b className={'primary-text'}>Offset: </b> Constant subtracted from weighted mean of neighborhood</li>
                                        <li><b className={'primary-text'}>C-val: </b> Value to fill past edges (when mode = 'constant')</li>
                                        <li><b className={'primary-text'}>Method: </b> Method to determine threshold for local neighborhood
                                            <ul><li><b>{i18n.t("help.options")}:</b> generic, gaussian, mean, median</li></ul>
                                        </li>
                                        <li><b className={'primary-text'}>Mode: </b> Determines how the array borders are handled
                                            <ul><li><b>{i18n.t("help.options")}:</b> reflect, constant, nearest, mirror, wrap</li></ul>
                                        </li>
                                        <li><b className={'primary-text'}>Block size: </b> Odd size of pixel neighborhood
                                            <ul><li><b>{i18n.t("help.range")}:</b> {i18n.t("help.oddNum")} {i18n.t("help.from")} 1 {i18n.t("help.to")} 201</li></ul>
                                        </li>
                                    </ul>
                                    <p className={'text-start'}>{i18n.t("help.source")}: {' '}
                                        <CLink href={'https://scikit-image.org/docs/dev/api/skimage.filters.html#skimage.filters.threshold_local'} target="_blank">scikit-image: threshold_local</CLink>
                                    </p>
                                </CCallout>
                            </CRow>
                        </CCol>
                    </CRow>
                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://scikit-image.org/docs/dev/auto_examples/segmentation/plot_thresholding.html'} target="_blank">scikit-image: thresholding example</CLink></li>
                                <li><CLink href={'https://scikit-image.org/docs/dev/api/skimage.filters.html#skimage.filters.threshold_otsu'} target="_blank">scikit-image: otsu</CLink></li>
                                <li><CLink href={'https://scikit-image.org/docs/dev/api/skimage.filters.html#skimage.filters.threshold_local'} target="_blank">scikit-image: adaptive (local)</CLink>
                                </li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}