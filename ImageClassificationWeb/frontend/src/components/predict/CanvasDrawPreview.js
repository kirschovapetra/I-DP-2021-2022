import React, {useEffect, useRef, useState} from "react";
import {CButtonGroup, CCol, CContainer, CFormInput, CFormLabel, CImage, CPopover, CRow} from "@coreui/react";
import {SketchPicker} from "react-color";
import CanvasDraw from "react-canvas-draw";
import rgbHex from "rgb-hex";
import imgSrcPlaceholder from "../../../static/images/bg.png";
import imgSrc from "../../../static/images/oldPaperBg.jpg";
import {CheckGroup} from "../form/CheckGroup";
import {PREDICT_DRAW} from "../../utils";
import {capitalize} from "../../utils";
import {RangeGroup} from "../form/RangeGroup";
import {cilActionUndo, cilTrash} from "@coreui/icons";
import {ButtonWithIcon} from "../form/ButtonWithIcon";
import i18n from "../../translation/i18n";

/***
 * Check if component is mounted
 * Source : https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component
 * @returns {React.MutableRefObject<boolean>}
 */
export function useIsMounted() {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => isMounted.current = false;
    }, []);

    return isMounted;
}

/***
 *
 * @param dataUrl - data URL of image
 * @param changeDataUrl - data URL setter
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CanvasDrawPreview = ({dataUrl, changeDataUrl}) => {
    const isMounted = useIsMounted();
    const canvasHeight = 200
    const canvasWidth = 200
    const canvasRef = useRef(null)
    const noiseMaskRef = useRef(null)
    const canvasDestinationRef = useRef(null)
    const [resetChanged, setResetChanged] = useState()

    const init = {
        brushRadiusRange: {
            id: PREDICT_DRAW.BRUSH_RADIUS,
            name: PREDICT_DRAW.BRUSH_RADIUS,
            value: 10.0,
            step: 1.0,
            min: 1.0,
            max: 50.0,
            label: capitalize(i18n.t("constants.predictDraw.brushRadius")),
            onChange: (e) => setBrushRadiusRange(item => item.id === e.target.id ? {...item, value: parseFloat(e.target.value)} : item),
        },
        bgSwitch: {
            name: PREDICT_DRAW.BACKGROUND,
            id: PREDICT_DRAW.BACKGROUND,
            value: PREDICT_DRAW.BACKGROUND,
            checked: false,
            label: capitalize(i18n.t("constants.predictDraw.background")),
            onChange: (e) => setBgSwitch({...bgSwitch, checked: e.target.checked})
        },
        blurRange: {
            id: PREDICT_DRAW.BLUR,
            name: PREDICT_DRAW.BLUR,
            value: 0.0,
            step: 0.5,
            min: 0.0,
            max: 20.0,
            label: capitalize(i18n.t("constants.predictDraw.blur")),
            onChange: (e) => setBlurRange(item => item.id === e.target.id ? {...item, value: parseFloat(e.target.value)} : item),
        },
        noiseRange: {
            id: PREDICT_DRAW.NOISE,
            name: PREDICT_DRAW.NOISE,
            value: 0.0,
            step: 1.0,
            min: 0.0,
            max: 255.0,
            label: capitalize(i18n.t("constants.predictDraw.noise")),
            onChange: (e) => setNoiseRange(item => item.id === e.target.id ? {...item, value: parseFloat(e.target.value)} : item),
        }
    }

    const [brushRadiusRange, setBrushRadiusRange] = useState(init.brushRadiusRange)
    const [blurRange, setBlurRange] = useState(init.blurRange)
    const [noiseRange, setNoiseRange] = useState(init.noiseRange)
    const [bgSwitch, setBgSwitch] = useState(init.bgSwitch)
    const [backgroundImage, setBackgroundImage] = useState(imgSrcPlaceholder)
    const [brushColor, setBrushColor] = useState('#000000')

    const randomNoise = (alpha, canvas) => {
        // src: https://gist.github.com/donpark/1796361

        if (!canvas) return

        let width = canvas.width;
        let height = canvas.height;

        let g = canvas.getContext("2d")
        let imageData = g.getImageData(0, 0, width, height)
        let i = 0;
        while (i < imageData.data.length) {
            imageData.data[i++] = imageData.data[i++] = imageData.data[i++] = (Math.random() * 256) | 0;
            imageData.data[i++] = alpha;
        }

        return imageDataToImage(imageData);
    }

    function imageDataToImage(imageData) {
        let canvas = noiseMaskRef.current
        if (!canvas) return

        let ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);

        return canvas.toDataURL();
    }

    const initImage = (src) => {
        let img = new Image()
        img.src = src
        img.crossOrigin = "anonymous"
        return img
    }

    const initCanvasContext = (canvas) => {
        let ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `blur(${blurRange.value}px)`
        return ctx
    }

    const copyCanvas = (sourceCanvas, destinationCanvas, ctx, noiseChanged) => {
        let writingImage = initImage(sourceCanvas.getDataURL())
        writingImage.addEventListener('load', e => {
            ctx.drawImage(writingImage, 0, 0)

            let noiseImage = initImage(noiseChanged ? randomNoise(noiseRange.value, destinationCanvas) : noiseMaskRef.current?.toDataURL())
            noiseImage.addEventListener('load', e => {
                ctx.drawImage(noiseImage, 0, 0)
                let newDataUrl = destinationCanvas?.toDataURL()
                if (isMounted.current) { changeDataUrl(newDataUrl) }

            })

        })
    }

    const updateImage = (noiseChanged) => {

        let sourceCanvas = canvasRef.current
        let destinationCanvas = canvasDestinationRef.current
        let ctx = initCanvasContext(destinationCanvas)

        if (!sourceCanvas || !destinationCanvas) return

        let bgImage = initImage(backgroundImage)
        bgImage.addEventListener('load', e => {
            ctx.drawImage(bgImage, 0, 0)
            copyCanvas(sourceCanvas, destinationCanvas, ctx, noiseChanged)
        })
    }

    const updateBrushColor = (e) => {
        const rgba = e.rgb
        setBrushColor('#' + rgbHex(rgba.r, rgba.g, rgba.b, rgba.a))
    }

    useEffect(() => {
        updateImage(true)
    }, [noiseRange])
    useEffect(() => {
        updateImage(false)
    }, [backgroundImage, blurRange])
    useEffect(() => {
        setBackgroundImage(bgSwitch.checked ? imgSrc : imgSrcPlaceholder)
    }, [bgSwitch])


    return (
        <CContainer>
            <CRow className={'text-start mx-auto justify-content-center'}>
                <h5 className={'col-lg-10'}>{i18n.t("predict.canvasSettings")}: </h5>
            </CRow>
            {/*color, radius */}
            <CRow className={'text-end mx-auto my-3 justify-content-center'}>
                <CCol xl={4} className={'justify-content-center'}>
                    <CRow>
                        <CFormLabel htmlFor={'brush_color'} className="col-lg-6 col-form-label text-center">{i18n.t("predict.color")}</CFormLabel>
                        <CCol size={3}>
                            <CPopover placement="bottom" content={<SketchPicker color={brushColor} onChange={updateBrushColor}/>}>
                                <div style={{width: 'fit-content', height: 'fit-content', marginLeft: 'auto', marginRight: 'auto'}} className={'col justify-content-center mx-auto text-center'}>
                                    <CFormInput readOnly type={'color'} id={'brush_color'} name={'brush_color'} className={'col justify-content-center mx-auto text-center'}
                                                size={'sm'} value={brushColor.substr(0, 7)} onChange={e => e.preventDefault()} onClick={e => e.preventDefault()}
                                    />
                                </div>
                            </CPopover>
                        </CCol>
                    </CRow>
                </CCol>
                <CCol xl={6} className={'justify-content-start'}>
                    <RangeGroup rangeItems={[brushRadiusRange]} labelSize={5}/>
                </CCol>
            </CRow>
            {/* bg */}
            <CRow className={'text-end mt-2 mx-auto justify-content-center'}>
                <CCol sm={4} md={4} lg={4} className={'text-center mx-auto justify-content-center'}>
                    <CheckGroup type="switch" radioItems={[bgSwitch]} direction={"horizontal"}/>
                </CCol>
            </CRow>
            {/* buttons */}
            <CRow className={'text-center mb-3 mx-auto'}>
                <CButtonGroup role="group" className={'col-xl-5 col-lg-8 col-md-8 col-sm-8 text-center mx-auto'}>
                    <ButtonWithIcon color="danger" className={'mx-1'} disabled={false} onClick={() => canvasRef.current?.eraseAll()}
                                    showSpinner={false} icon={cilTrash} value={i18n.t("predict.erase")} size={'sm'}/>
                    <ButtonWithIcon color="warning" className={'mx-1'} disabled={false} onClick={() => canvasRef.current?.undo()}
                                    showSpinner={false} icon={cilActionUndo} value={i18n.t("predict.undo")} size={'sm'}/>
                </CButtonGroup>
            </CRow>
            {/* canvas */}
            <CRow className={'mx-auto mb-3 text-center'}>
                <CanvasDraw
                    style={{border: "2px solid lightgrey", margin: 'auto', padding: '0px'}}
                    ref={canvasRef}
                    brushColor={brushColor}
                    brushRadius={brushRadiusRange.value}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    imgSrc={backgroundImage}
                    enablePanAndZoom
                    clampLinesToDocument
                    onChange={() => updateImage(false)}
                />
                <span className={'form-text'}>{i18n.t("constants.writeDigit")}</span>
            </CRow>
            <CRow className={'text-end mx-auto my-3 justify-content-center'}>
                <CCol lg={6} className={'justify-content-center'}>
                    <CRow>
                        <h5 className={'text-start'}>{i18n.t("predict.filters")}: </h5>
                        <RangeGroup rangeItems={[blurRange, noiseRange]} labelSize={5} key={resetChanged}/>
                        <div className={'text-center my-2'}>
                            <ButtonWithIcon color="danger" className={'mx-1'} disabled={false} showSpinner={false} icon={cilTrash}
                                            value={i18n.t("predict.resetFilters")} size={'sm'} onClick={() => {
                                setBlurRange(init.blurRange)
                                setNoiseRange(init.noiseRange)
                                setResetChanged(Date.now())
                            }}/>
                        </div>
                    </CRow>
                </CCol>
                <CCol lg={4} className={'justify-content-start'}>
                    <div style={{margin: 'auto', padding: '10px'}}>
                        {dataUrl && <CImage style={{border: "1px solid lightgrey", margin: 'auto'}} src={dataUrl} alt={'thumbnail'} height={120} width={120}/>}
                    </div>
                    {dataUrl && <span className={'form-text'}>{i18n.t("constants.seeFilters")}</span>}
                </CCol>
            </CRow>

            <canvas ref={noiseMaskRef} className="noiseMaskCanvas" width={canvasWidth} height={canvasHeight} hidden={true}/>
            <canvas ref={canvasDestinationRef} className="destinationCanvas" width={canvasWidth} height={canvasHeight} hidden={true}/>

        </CContainer>
    )
}