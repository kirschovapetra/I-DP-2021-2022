import {CButton, CButtonGroup, CCol, CCollapse, CRow, CTooltip} from "@coreui/react";
import ReactMultiCrop from "../../../../lib/ReactMultiCrop/ReactMultiCrop";
import bg from "../../../../static/images/bg.png";
import React, {useState} from "react";
import {cilSync, cilZoomIn, cilZoomOut,} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import i18n from "../../../translation/i18n";
import {CanvasControlsCallout} from "../../help/CanvasControlsCallout";

/**
 * Canvas for image multi-crop
 * @param setCropListOriginal - method to set list of result cropped images
 * @param bgImage - canvas background image
 * @param colorMap - color map for selections
 * @param resultMap - result texts for selections
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CropCanvas = ({setCropListOriginal, bgImage, colorMap, resultMap}) => {

    const [zoom, setZoom] = useState(1.0)
    const [controlsVisible, setControlsVisible] = useState(false)
    const zoomCoef = 20

    const zoomOut = () => {

        let zoomPercent = parseInt(zoom * 100)
        if (zoomPercent < zoomCoef) return

        let base = zoomPercent / zoomCoef
        let newZoom = parseInt(Math.floor(base) * zoomCoef)

        setZoom(zoomPercent === newZoom ? zoom - zoomCoef / 100 : newZoom / 100)
    }
    const zoomIn = () => {
        let zoomPercent = parseInt(zoom * 100)
        let base = zoomPercent / zoomCoef
        let newZoom = parseInt(Math.ceil(base) * zoomCoef)
        setZoom(zoomPercent === newZoom ? zoom + zoomCoef / 100 : newZoom / 100)
    }

    return (
        <div>
            <CRow className={'text-center mb-2 mx-auto'}>
                <p className={'text-center mb-2 mx-auto'}>{i18n.t("help.zoom")}: <span className={'primary-text'}>{(zoom * 100).toFixed(2)} %</span></p>
                <CCol className={'text-start'}>
                    <CButton color={'primary'} variant={"outline"} onClick={() => setControlsVisible(!controlsVisible)} shape="rounded-pill">
                        {controlsVisible ? i18n.t("predict.hideCanvasControls") : i18n.t("predict.showCanvasControls")}
                    </CButton>
                </CCol>
                <CCol>
                    <CButtonGroup role="group" className={'text-center mx-auto col-11'}>
                        <CTooltip
                            content="Zoom in" placement={'bottom'}>
                            <CButton color={'light'} className={'px-0 mx-1'} onClick={zoomIn} shape="rounded-pill" disabled={!bgImage || bgImage === ''}>
                                <CIcon icon={cilZoomIn} size={'xl'}/>
                            </CButton>
                        </CTooltip>
                        <CTooltip
                            content="Zoom out" placement={'bottom'}>
                            <CButton color={'light'} className={'px-0 mx-1'} onClick={zoomOut} shape="rounded-pill" disabled={!bgImage || bgImage === ''}>
                                <CIcon icon={cilZoomOut} size={'xl'}/>
                            </CButton>
                        </CTooltip>
                        <CTooltip
                            content="Reset zoom" placement={'bottom'}>
                            <CButton color={'light'} className={'px-0 mx-1'} onClick={() => setZoom(1.0)} shape="rounded-pill" disabled={!bgImage || bgImage === ''}>
                                <CIcon icon={cilSync} size={'xl'}/>
                            </CButton>
                        </CTooltip>
                    </CButtonGroup>
                </CCol>
                <CCol/>
            </CRow>
            <CRow>
                <CCollapse visible={controlsVisible}><CanvasControlsCallout/></CCollapse>
            </CRow>
            <CRow>
                <ReactMultiCrop
                    id="canvas"
                    cropBackgroundOpacity={0.0}
                    zoomLevel={zoom}
                    cornerSize={8}
                    colorMap={colorMap}
                    resultMap={resultMap}
                    input={{onChange: (value) => setCropListOriginal(value)}}
                    zoomChanged={(zoomValue) => setZoom(zoomValue)}
                    includeHtmlCanvas={true}
                    includeDataUrl={true}
                    style={{background: `url("${bg}")`}}
                    image={bgImage}
                />
            </CRow>
        </div>
    )

}