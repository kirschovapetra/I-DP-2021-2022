import React from 'react'

import {CCard, CCardBody, CCardHeader, CCol, CLink, CRow} from '@coreui/react'
import i18n from "../../translation/i18n";
import HomePage from "./HomePage";

/***
 * About page
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const About = () => {
    return (
        <>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>{i18n.t("about.heading")}</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol>
                                    <p>
                                        {i18n.t("about.intro")} <br/><br/>
                                        <b className={'primary-text'}>{i18n.t("about.title")}: </b> {i18n.t("about.titleText")} <br/>
                                        <b className={'primary-text'}>{i18n.t("about.author")}: </b> Bc. Petra Kirschová <br/>
                                        <b className={'primary-text'}>{i18n.t("about.supervisor")}: </b> Ing. Pavol Marák, PhD. <br/>
                                        <b className={'primary-text'}>{i18n.t("about.placeAndYear")}: </b> {i18n.t("about.placeAndYearText")} <br/><br/>
                                        <b className={'primary-text'}>{i18n.t("about.abstract")}: </b> <br/>
                                        {i18n.t("about.abstractText1")}
                                        <br/><br/>
                                        {i18n.t("about.abstractText2")}
                                    </p>

                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>{i18n.t("about.sources")}</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol>
                                    <ul className={'text-start'}>
                                        <li><CLink href={'https://www.npmjs.com/package/@berviantoleo/react-multi-crop'} target="_blank">@berviantoleo/react-multi-crop (&copy; 2020-2021 Bervianto Leo
                                            Pratama)</CLink></li>
                                        <li><CLink href={'@coreui/coreui (&copy; 2011-2021 Twitter, Inc., 2011-2021 The Bootstrap Authors)'} target="_blank">@coreui/coreui (&copy; 2011-2021 Twitter,
                                            Inc., 2011-2021 The Bootstrap Authors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@coreui/icons'} target="_blank">@coreui/icons (&copy; coreui)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@coreui/icons-react'} target="_blank">@coreui/icons-react (&copy; coreui) </CLink></li>
                                        <li><CLink href={'https://github.com/coreui/coreui-free-react-admin-template'} target="_blank">@coreui/coreui-free-react-admin-template (&copy; 2021
                                            creativeLabs Lukasz Holeczek)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/axios'} target="_blank">axios (&copy; 2014-present Matt Zabriskie) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/chart.js'} target="_blank">chart.js (&copy; 2014-2022 Chart.js Contributors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/chartjs-plugin-datalabels'} target="_blank">chartjs-plugin-datalabels (&copy; 2017-2021
                                            chartjs-plugin-datalabels contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/core-js'} target="_blank">core-js (&copy; 2014-2022 Denis Pushkarev) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/fabric'} target="_blank">fabric (&copy; 2008-2015 Printio (Juriy Zaytsev, Maxim Chernyak))</CLink></li>

                                        <li><CLink href={'https://www.npmjs.com/package/i18next'} target="_blank">i18next (&copy; 2022 i18next)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/i18next-browser-languagedetector'} target="_blank">i18next-browser-languagedetector (&copy; 2022
                                            i18next)</CLink></li>

                                        <li><CLink href={'https://www.npmjs.com/package/react'} target="_blank">react (&copy; Facebook, Inc. and its affiliates.)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-app-polyfill'} target="_blank">react-app-polyfill (&copy; 2013-present,Facebook,Inc.)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-canvas-draw'} target="_blank">react-canvas-draw (&copy; 2018 Martin Beierling)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-chartjs-2'} target="_blank">react-chartjs-2 (&copy; 2020 Jeremy Ayerst)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-color'} target="_blank">react-color (&copy; 2015 Case Sandberg)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-dom'} target="_blank">react-dom (&copy; Facebook, Inc. and its affiliates.)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-i18next'} target="_blank">react-i18next (&copy; 2022 i18next)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-imgpro'} target="_blank">react-imgpro (&copy; Nitin Tulswani)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-router-dom'} target="_blank">react-router-dom (&copy; React Training 2015-2019, Remix Software
                                            2020-2021)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/react-use-file-reader'} target="_blank">react-use-file-reader (&copy; 2020 Jacob Lowe)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/recharts'} target="_blank">recharts (&copy; 2015 recharts) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/rgb-hex'} target="_blank">rgb-hex (&copy; Sindre Sorhus) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/rsuite'} target="_blank">rsuite (&copy; HYPERS, Inc. and its affiliates.) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/simplebar-react'} target="_blank">simplebar-react (&copy; 2015 Jonathan Nicol) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/typescript'} target="_blank">typescript (&copy; TypeScript contributors, Apache License Version 2.0, January
                                            2004) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/uuid'} target="_blank">uuid (&copy; Robert Kieffer and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/css-loader'} target="_blank">css-loader (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/sass'} target="_blank">sass (&copy; 2016, Google Inc.) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/sass-loader'} target="_blank">sass-loader (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/style-loader'} target="_blank">style-loader (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/ts-loader'} target="_blank">ts-loader (&copy; 2015 TypeStrong) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/url-loader'} target="_blank">url-loader (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/webpack'} target="_blank">webpack (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/webpack-cli'} target="_blank">webpack-cli (&copy; JS Foundation and other contributors) </CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/babel-loader'} target="_blank">babel-loader (&copy; 2014-2019 Luís Couto)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@babel/core'} target="_blank">@babel/core (&copy; 2014-present Sebastian McKenzie and other
                                            contributors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@babel/plugin-transform-runtime'} target="_blank">@babel/plugin-transform-runtime (&copy; 014-present Sebastian
                                            McKenzie and other contributors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@babel/preset-env'} target="_blank">@babel/preset-env (&copy; 2014-present Sebastian McKenzie and other
                                            contributors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/@babel/preset-react'} target="_blank">@babel/preset-react (&copy; 2014-present Sebastian McKenzie and other
                                            contributors)</CLink></li>
                                        <li><CLink href={'https://www.npmjs.com/package/babel-polyfill'} target="_blank">babel-polyfill (&copy; 2014-present Sebastian McKenzie and other
                                            contributors)</CLink></li>
                                    </ul>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}
export default About