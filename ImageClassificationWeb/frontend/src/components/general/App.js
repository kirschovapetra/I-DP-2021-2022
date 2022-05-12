import React, {Suspense, useState} from 'react'
import {CContainer, CFooter, CLink, CSpinner} from "@coreui/react";
import {Route, Routes} from "react-router-dom";
import {ENDPOINT, PREDICT_VIEW} from "../../utils";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import i18n from "i18next";

const HomePage = React.lazy(() => import('./HomePage'))
const About = React.lazy(() => import('./About'))
const PredictView = React.lazy(() => import('../predict/views/PredictView'))

/***
 * Main App component
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const App = () => {

    i18n.changeLanguage(localStorage.getItem("lang")).then()

    const [sidebarShow, setSidebarShow] = useState(true)
    const [changed, setChanged] = useState(true)

    const changeLang = (lang) => {
        localStorage.setItem("lang", lang)
        i18n.changeLanguage(lang).then(setChanged(Date.now()))
    }

    return (
        <div>
            <Sidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} key={changed}/>
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <Header changeSidebarShow={() => setSidebarShow(!sidebarShow)} changeLang={changeLang}/>
                <div className="body flex-grow-1 px-lg-5" key={changed}>
                    <div className={'px-lg-5'}>
                        <CContainer fluid>
                            <Suspense fallback={<CSpinner color="primary"/>}>
                                <Routes>
                                    <Route exact path="/" name="Home" element={<HomePage/>}/>
                                    <Route exact path={ENDPOINT.ABOUT} name="About" element={<About/>}/>
                                    <Route exact path="/single/:method" name="Single image"
                                           element={<PredictView predictView={PREDICT_VIEW.SINGLE}/>}/>
                                    <Route exact path="/crop/:method" name="Crop images"
                                           element={<PredictView predictView={PREDICT_VIEW.CROP}/>}/>
                                    <Route exact path="/draw/:method" name="Draw image"
                                           element={<PredictView predictView={PREDICT_VIEW.DRAW}/>}/>
                                </Routes>
                            </Suspense>
                        </CContainer>
                    </div>
                </div>
                <CFooter>
                    <div/>
                    <div>
                    <span className={'text-end me-auto'}>
                        <p className={'mb-0'}>&copy; 2022 Petra Kirschová</p>
                        {i18n.t("footer.coreui")} <CLink href="https://coreui.io" target="_blank">CoreUI</CLink>
                    </span>
                    </div>
                </CFooter>
            </div>
        </div>
    )
}
