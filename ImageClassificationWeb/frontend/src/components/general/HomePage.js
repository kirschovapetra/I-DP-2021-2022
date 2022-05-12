import React from 'react'

import {CCard, CCardBody, CCardHeader, CCol, CRow} from '@coreui/react'
import {cilBasket, cilBolt, cilClone, cilGraph, cilLayers} from '@coreui/icons'
import {HelpWidget} from "../help/HelpWidget";
import {VGG19Help} from "../help/models/VGG19Help";
import {ResNet50Help} from "../help/models/ResNet50Help";
import {ResNeXt50Help} from "../help/models/ResNeXt50Help";
import {InceptionV3Help} from "../help/models/InceptionV3Help";
import {CustomHelp} from "../help/models/CustomHelp";
import {BaggingHelp} from "../help/models/BaggingHelp";
import {BoostingHelp} from "../help/models/BoostingHelp";
import {StackingHelp} from "../help/models/StackingHelp";
import {TwoStepHelp} from "../help/models/TwoStepHelp";
import i18n from "../../translation/i18n";

/***
 * Home page
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
const HomePage = () => {
    return (
        <>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>{i18n.t("homepage.base")}</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xl>
                                    <HelpWidget color='info' title="VGG19" icon={cilGraph} content={<VGG19Help/>} modalSize={'xl'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='info' title="ResNet50" icon={cilGraph} content={<ResNet50Help/>} modalSize={'xl'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='info' title="ResNeXt50" icon={cilGraph} content={<ResNeXt50Help/>} modalSize={'xl'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='info' title="InceptionV3" icon={cilGraph} content={<InceptionV3Help/>} modalSize={'xl'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='info' title="Custom" icon={cilGraph} content={<CustomHelp/>} modalSize={'xl'}/>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>{i18n.t("homepage.ensembles")}</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xl>
                                    <HelpWidget color='warning' title="Bagging" icon={cilBasket} content={<BaggingHelp/>} modalSize={'lg'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='warning' title="Boosting" icon={cilBolt} content={<BoostingHelp/>} modalSize={'lg'}/>
                                </CCol>
                                <CCol xl>
                                    <HelpWidget color='warning' title="Stacking" icon={cilLayers} content={<StackingHelp/>} modalSize={'lg'}/>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>{i18n.t("homepage.twoStep")}</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xl>
                                    <HelpWidget color='success' title={i18n.t("homepage.twoStep")} icon={cilClone} content={<TwoStepHelp/>} modalSize={'lg'}/>
                                </CCol>
                                <CCol xl/>
                                <CCol xl/>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}
export default HomePage