import React from "react";
import {CCallout, CCol, CImage, CLink, CRow} from "@coreui/react";
import {capitalize} from "../../../utils";
import i18n from "i18next";

/***
 * Help modal content for denoise
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const DenoiseLegend = () => {

    const imagesRoot = '../../../../../static/images/help/preprocessing'

    return (
        <>
            <CRow className={'justify-content-center mx-auto'}>
                <CCol lg={11}>
                    <h5 className={'text-start mb-3 primary-text'}>{i18n.t("help.denoiseAlg")}</h5>
                    <CRow>
                        <CCol lg={3}>
                            <h6 className={'mb-3 ml-3 text-start'}>{capitalize(i18n.t("help.original"))}: </h6>
                            <CImage className={'mb-1'} thumbnail src={`${imagesRoot}/denoiseOriginal.png`}/>
                        </CCol>
                        <CCol/>
                        <CCol lg={7}>
                            <h6 className={'mb-3 text-start'}>Bilateral denoising: </h6>
                            <CRow className={'justify-content-start'}>
                                <CCol lg={7}><CImage className={'mb-1'} thumbnail src={`${imagesRoot}/denoiseBilateral1.png`}/></CCol>
                                <CCol><CImage thumbnail src={`${imagesRoot}/denoiseBilateral2.png`}/></CCol>
                            </CRow>
                            <CRow>
                                <CCallout color="primary">
                                    <ul className={'text-start'} style={{fontWeight: 'normal'}}>
                                        <li><b className={'primary-text'}>Window size: </b>Filter size</li>
                                        <li><b className={'primary-text'}>Sigma color: </b>Standard deviation for grayvalue/color distance</li>
                                        <li><b className={'primary-text'}>Sigma spatial: </b>Standard deviation for range distance</li>
                                        <li><b className={'primary-text'}>Bins: </b>Number of discrete values for color filtering</li>
                                        <li><b className={'primary-text'}>Mode: </b>How to handle values outside the borders
                                            <ul>
                                                <li><b>{i18n.t("help.options")}:</b> constant, edge, symmetric, reflect, wrap</li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <p className={'text-start'}>{i18n.t("help.source")}: {' '}
                                        <CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#skimage.restoration.denoise_bilateral'} target="_blank">scikit-image:
                                            denoise_bilateral</CLink>
                                    </p>
                                </CCallout>
                            </CRow>
                        </CCol>
                    </CRow>
                    <CRow className={'my-3'}>
                        <CCol>
                            <h6 className={'mb-3 text-start'}>Total-variance Chambolle denoising: </h6>
                            <CRow className={'justify-content-start'}>
                                <CCol lg={7}><CImage className={'mb-1'} thumbnail src={`${imagesRoot}/denoiseTv1.png`}/></CCol>
                                <CCol><CImage thumbnail src={`${imagesRoot}/denoiseTv2.png`}/></CCol>
                            </CRow>
                        </CCol>
                        <CCol>
                            <h6 className={'mb-3 text-start'}>Non-local means denoising: </h6>
                            <CRow className={'justify-content-start'}>
                                <CCol lg={7}><CImage className={'mb-1'} thumbnail src={`${imagesRoot}/denoiseNl1.png`}/></CCol>
                                <CCol><CImage thumbnail src={`${imagesRoot}/denoiseNl2.png`}/></CCol>
                            </CRow>
                        </CCol>
                    </CRow>

                    <CRow className={'my-3'}>
                        <CCol>
                            <CCallout color="primary">
                                <ul className={'text-start'} style={{fontWeight: 'normal'}}>
                                    <li><b className={'primary-text'}>Weight: </b>Denoising strength</li>
                                    <li><b className={'primary-text'}>Eps: </b>Relative difference of the cost function</li>
                                    <li><b className={'primary-text'}>Max. iterations: </b>Max. number of iterations for optimization</li>
                                </ul>
                                <p className={'text-start'}>{i18n.t("help.source")}: {' '}
                                    <CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#skimage.restoration.denoise_tv_chambolle'} target="_blank">scikit-image:
                                        denoise_tv_chambolle</CLink>
                                </p>
                            </CCallout>
                        </CCol>
                        <CCol>
                            <CCallout color="primary">
                                <ul className={'text-start'} style={{fontWeight: 'normal'}}>
                                    <li><b className={'primary-text'}>Patch size: </b>Size of denoising patches</li>
                                    <li><b className={'primary-text'}>Patch distance: </b>Maximal patch distance in pixels</li>
                                </ul>
                                <p className={'text-start'}>{i18n.t("help.source")}: {' '}
                                    <CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#denoise-nl-means'} target="_blank">scikit-image: denoise_nl_means</CLink>
                                </p>
                            </CCallout>
                        </CCol>
                    </CRow>

                    <CRow className={'mt-3 ml-3 text-start'}>
                        <div>
                            {i18n.t("help.docu")}:<br/>
                            <ul>
                                <li><CLink href={'https://scikit-image.org/docs/dev/auto_examples/filters/plot_denoise.html'} target="_blank">scikit-image: denoising example</CLink></li>
                                <li><CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#skimage.restoration.denoise_bilateral'} target="_blank">scikit-image:
                                    denoise_bilateral</CLink></li>
                                <li><CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#skimage.restoration.denoise_tv_chambolle'} target="_blank">scikit-image:
                                    denoise_tv_chambolle</CLink></li>
                                <li><CLink href={'https://scikit-image.org/docs/dev/api/skimage.restoration.html#denoise-nl-means'} target="_blank">scikit-image: denoise_nl_means</CLink></li>
                            </ul>
                        </div>
                    </CRow>
                </CCol>
            </CRow>
        </>
    )
}