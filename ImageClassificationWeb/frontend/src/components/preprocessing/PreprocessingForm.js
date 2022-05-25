import {CCol, CFormSwitch, CProgress, CProgressBar, CRow, CContainer} from "@coreui/react";
import React, {useEffect, useRef, useState} from "react";
import ProcessImage from "react-imgpro";
import {Flip} from "./preprocessingFormElements/Flip";
import {Rotation} from "./preprocessingFormElements/Rotation";
import {Brightness} from "./preprocessingFormElements/Brightness";
import {Contrast} from "./preprocessingFormElements/Contrast";
import {ColorMode} from "./preprocessingFormElements/ColorMode";
import {Resize} from "./preprocessingFormElements/Resize";
import {Threshold} from "./preprocessingFormElements/threshold/Threshold";
import {Denoise} from "./preprocessingFormElements/denoise/Denoise";
import {ENDPOINT, PREPROCESSING} from "../../utils";
import {createFormData, sendPreprocessingRequest, sendPreprocessingRequestMulti} from "../../utils";
import {HelpIconTooltip} from "../help/HelpIconTooltip";
import {NormalizeLegend} from "../help/preprocessing/NormalizeLegend";
import i18n from "../../translation/i18n";

/**
 * Form with image preprocessing tools
 * @param imageSrc - original image source data URL
 * @param fileUrl - current URL to be edited
 * @param setFileUrl - method to update crrent fileUrL
 * @param setEditFileUrl - method to update crrent editFileUrl
 * @param imageId - image identificator
 * @param imageSize - size of image
 * @param imageSizeOriginal - original size of image
 * @param updateDimensions - change image size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */

let interval = undefined;

export const PreprocessingForm = React.forwardRef(({imageSrc, fileUrl, setFileUrl, setEditFileUrl, imageId, imageSize, imageSizeOriginal, updateDimensions}, ref) => {


    const flipRef = useRef()
    const rotationRef = useRef()
    const brightnessRef = useRef()
    const contrastRef = useRef()
    const colorRef = useRef();
    const resizeRef = useRef();
    const thresholdRef = useRef();
    const denoiseRef = useRef();

    const [flip, setFlip] = useState({horizontal: false, vertical: false})
    const [rotation, setRotation] = useState(0.0) // od -360 do 360
    const [brightness, setBrightness] = useState(0.0) // od -1 do 1
    const [contrast, setContrast] = useState(0.0) // od -1 do 1
    const [colorMode, setColorMode] = useState(PREPROCESSING.COLOR_MODE.RGB)
    const [color, setColor] = useState('#fff')

    const [normalize, setNormalize] = useState(false)

    const [imageRef, setImageRef] = useState(null)

    const [changedThreshold, setChangedThreshold] = useState(false)
    const [thresholdRequest, setThresholdRequest] = useState(false)
    const [denoiseRequest, setDenoiseRequest] = useState(false)
    const [changedDenoise, setChangedDenoise] = useState(false)

    const [running, setRunning] = useState(true);
    const [progress, setProgress] = useState(0);

    const updateSize = (newSize) => updateDimensions(newSize, imageId)

    const resetLoadingBar = () => {
        if (!running) setRunning(true)
    }

    useEffect(() => {
        if (running) {
            interval = setInterval(() => {
                setProgress((prev) => prev + 1);
            }, 10);
        } else {
            clearInterval(interval);
        }
    }, [running]);

    useEffect(() => {

        if (progress === 200) {
            setRunning(false);
            clearInterval(interval);
            setProgress(0);
        }
    }, [progress]);

    useEffect(() => {

            const sendRequest = async () => {
                if (changedThreshold && changedDenoise) {
                    await sendPreprocessingRequestMulti(ENDPOINT.DENOISE, ENDPOINT.THRESHOLD, denoiseRequest, thresholdRequest, setFileUrl)
                } else if (changedThreshold) {
                    await sendPreprocessingRequest(ENDPOINT.THRESHOLD, createFormData(thresholdRequest), setFileUrl)
                } else if (changedDenoise) {
                    await sendPreprocessingRequest(ENDPOINT.DENOISE, createFormData(denoiseRequest), setFileUrl)
                } else {
                    if (imageId) setFileUrl(localStorage.getItem(imageId))
                }
            }
            sendRequest().then()

        }, [changedThreshold, changedDenoise, thresholdRequest, denoiseRequest]
    )


    useEffect(() => {
        if (imageRef) {
            imageRef.style.margin = 'auto'
            imageRef.style.display = 'block'
            imageRef.parentElement.style.display = 'flex'
            imageRef.parentElement.style.alignItems = 'center'
            imageRef.parentElement.style.justifyContent = 'center'
        }
    }, [imageRef])

    React.useImperativeHandle(ref, () => ({
        async clearForm() {
            flipRef.current?.clear()
            rotationRef.current?.clear()
            brightnessRef.current?.clear()
            contrastRef.current?.clear()
            colorRef.current?.clear()
            updateSize(imageSizeOriginal)
            resizeRef.current?.clear()
            thresholdRef.current?.clear()
            denoiseRef.current?.clear()
            setNormalize(false)
            setFileUrl(imageSrc)
            if (imageId) localStorage.setItem(imageId, imageSrc)
        }
    }))

    return (
        <>
            <CRow>
                <CCol xl={9}>
                    <CRow>
                        {/* Flip + normalize */}
                        <CCol xl={6}>
                            <CRow>
                                <CCol lg={6} className={'text-center mx-auto justify-content-center'}>
                                    <CRow className={'text-center mx-auto justify-content-center'}>
                                        <Flip ref={flipRef} setFlip={setFlip}/>
                                    </CRow>
                                </CCol>
                                <CCol lg={6} className={'text-center mx-auto justify-content-center'}>

                                    <h6 className="mt-2 text-center">
                                        <span className={'mt-2 h5'}>{i18n.t("preprocessingForm.normalize")}</span>
                                        <span className={'mx-2'}><HelpIconTooltip content={<NormalizeLegend/>} title={i18n.t("preprocessingForm.normalize")} height={20}/></span>
                                    </h6>
                                    <CRow className={'text-center mx-auto justify-content-center'}>
                                        <CFormSwitch id={'normalize'} name={'normalize'} value={'normalize'} className={'col-1'}
                                                     checked={normalize} onChange={() => setNormalize(!normalize)}/>
                                    </CRow>
                                </CCol>
                            </CRow>

                            {/* Resize */}
                            <CRow className={'text-center mx-auto justify-content-center'}>
                                <Resize ref={resizeRef} setDimensions={updateSize} dimensions={imageSize}/>
                            </CRow>

                            {/* Rotation, brightness, contrast */}
                            <CRow className={"text-center mt-2 justify-content-center mx-auto"}>
                                <CCol lg={11}>
                                    <Rotation ref={rotationRef} setRotation={setRotation}/>
                                    <Brightness ref={brightnessRef} setBrightness={setBrightness}/>
                                    <Contrast ref={contrastRef} setContrast={setContrast}/>
                                </CCol>
                            </CRow>
                        </CCol>
                        {/* color mode, threshold, denoise */}
                        <CCol xl={6} className={"text-center mt-2 justify-content-center mx-auto"}>
                            <ColorMode ref={colorRef} setColorMode={setColorMode} setColor={setColor}/>
                            <CRow>
                                <Threshold ref={thresholdRef} imageId={imageId}
                                           setThresholdRequest={setThresholdRequest}
                                           setChangedThreshold={setChangedThreshold}
                                           resetLoadingBar={resetLoadingBar}/>
                            </CRow>
                            <CRow className={'pb-3'}>
                                <Denoise ref={denoiseRef} imageId={imageId}
                                         setDenoiseRequest={setDenoiseRequest}
                                         setChangedDenoise={setChangedDenoise}
                                         resetLoadingBar={resetLoadingBar}/>
                            </CRow>
                        </CCol>
                    </CRow>
                </CCol>
                <CCol xl={3}>
                    {
                        running ?
                            <CProgress>
                                <CProgressBar color="info" variant="striped" animated value={progress}/>
                            </CProgress>

                            :
                            <CRow>
                                <ProcessImage
                                    image={fileUrl}
                                    flip={flip}
                                    rotate={{degree: rotation, mode: 'bilinear'}}
                                    brightness={brightness}
                                    contrast={contrast}
                                    greyscale={colorMode === PREPROCESSING.COLOR_MODE.GREYSCALE}
                                    sepia={colorMode === PREPROCESSING.COLOR_MODE.SEPIA}
                                    invert={colorMode === PREPROCESSING.COLOR_MODE.INVERT}
                                    normalize={normalize}
                                    resize={imageSize ? imageSize : undefined}
                                    colors={colorMode === PREPROCESSING.COLOR_MODE.CUSTOM ? {mix: {color: color}} : undefined}
                                    getImageRef={image => setImageRef(image)}
                                    processedImage={(src, err) => {
                                        if (!changedThreshold && !changedDenoise) {
                                            if (imageId) localStorage.setItem(imageId, fileUrl)
                                        }
                                        setEditFileUrl(src)
                                        if (err) console.log(err)
                                    }}
                                />
                            </CRow>
                    }
                </CCol>
            </CRow>
        </>
    )
})