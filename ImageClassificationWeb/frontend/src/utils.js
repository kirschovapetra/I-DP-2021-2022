import React from 'react'
import axios from "axios"
import {PredictViewSingle} from "./components/predict/views/PredictViewSingle"
import {SingleHelp} from "./components/help/SingleHelp"
import {PredictViewDraw} from "./components/predict/views/PredictViewDraw"
import {DrawHelp} from "./components/help/DrawHelp"
import {PredictViewCrop} from "./components/predict/views/PredictViewCrop"
import {CropHelp} from "./components/help/CropHelp"
import i18n from "./translation/i18n";

/********************************************** CONSTANTS ****************************************************/

export const MODELS = ["VGG19", "InceptionV3", "Custom", "ResNet50",
    // "ResNeXt50"
]
export const MODELS_STACKING = ["VGG19", "Custom", "ResNet50"]

export const ML_METHOD = {CNN: 'cnn', BAGGING: 'bagging', BOOSTING: 'boosting', STACKING: 'stacking', TWO_STEP: 'two-step'}

export const PREDICT_VIEW = {SINGLE: 'single', DRAW: 'draw', CROP: 'crop'}

export const ML = {MODEL: 'model', N_ESTIMATORS: 'n_estimators', N_FOLDS: 'n_folds'}

export const PREDICT_DRAW = {BACKGROUND: 'background', BRUSH_RADIUS: 'brush_radius', BLUR: 'blur', NOISE: 'noise'}

export const PREPROCESSING = {
    ROTATION: 'rotation', HEIGHT: 'height', WIDTH: 'width', BRIGHTNESS: 'brightness', CONTRAST: 'contrast', HORIZONTAL: 'horizontal', VERTICAL: 'vertical',
    COLOR_MODE: {RGB: 'rgb', SEPIA: 'sepia', GREYSCALE: 'greyscale', INVERT: 'invert', CUSTOM: 'custom'},
    THRESHOLD: {
        OFFSET: 'offset', C_VAL: 'c_val', ADAPT_METHOD: 'adapt_method', ADAPT_MODE: 'adapt_mode', BLOCK_SIZE: 'block_size',
        THRESHOLD_MODE: {NONE_THR: 'none_thr', OTSU: 'otsu', ADAPTIVE: 'adaptive'},
    },
    DENOISE: {
        WEIGHT: 'weight', EPS: 'eps', N_ITER_MAX: 'n_iter_max', PATCH_DISTANCE: 'patch_distance', PATCH_SIZE: 'patch_size',
        BILATERAL_MODE: 'bilateral_mode', BINS: 'bins', SIGMA_SPATIAL: 'sigma_spatial', SIGMA_COLOR: 'sigma_color', WINDOW_SIZE: 'window_size',
        DENOISE_MODE: {NONE_DEN: 'none_den', BILATERAL: 'bilateral', TV_CHAMBOLLE: 'tv_chambolle', NL_MEANS: 'nl_means'}
    }
}

export const ENDPOINT = {
    ABOUT: '/about',
    SINGLE: '/single',
    DRAW: '/draw',
    CROP: '/crop',
    DENOISE: '/denoise',
    THRESHOLD: '/threshold',
    PREDICT_CNN: '/predict/cnn/single',
    PREDICT_BAGGING: '/predict/bagging/single',
    PREDICT_BOOSTING: '/predict/boosting/single',
    PREDICT_STACKING: '/predict/stacking/single',
    PREDICT_TWO_STEP: '/predict/two-step/single',
    MULTIPREDICT_CNN: '/predict/cnn/multi',
    MULTIPREDICT_BAGGING: '/predict/bagging/multi',
    MULTIPREDICT_BOOSTING: '/predict/boosting/multi',
    MULTIPREDICT_STACKING: '/predict/stacking/multi',
    MULTIPREDICT_TWO_STEP: '/predict/two-step/multi',
}

/******************************************** CONSTANTS END **************************************************/

/**
 * get window's width and height
 * @returns {{width: number, height: number}}
 */
export const getWindowDimensions = () => {
    const {innerWidth: width, innerHeight: height} = window
    return {width, height}
}

/**
 * Capitalize string
 * @param inputString
 * @param replaceWith
 * @returns {string}
 */
export const capitalize = (inputString, replaceWith = ' ') => {
    return (inputString.charAt(0).toUpperCase() + inputString.slice(1)).replace('_', replaceWith)
}

/**
 * Send GET request to models endpoint
 * @param endpoint
 * @param setModels
 * @returns {Promise<void>}
 */
export const sendGetRequest = async (endpoint, setModels) => {
    await fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            setModels(data)
        })
        .catch((error) => console.error('Error:', error))
}

/**
 * Convert dict into formData
 * @param content
 * @returns {FormData}
 */
export const createFormData = (content) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(content)) {
        formData.append(key, value)
    }
    return formData
}

/**
 * Send POST request to predict endpoint
 * @param endpoint
 * @param formData
 * @param mapPredictResults
 * @param setLoading
 * @returns {Promise<void>}
 */
export const sendPredictRequest = async (endpoint, formData, mapPredictResults, setLoading) => {
    setLoading(true)
    await axios.post(endpoint, formData)
        .then((response) => {
            let data = response.data
            console.log('Success:', data)
            mapPredictResults(JSON.parse(data.results), JSON.parse(data.pred_list), JSON.parse(data.classes), JSON.parse(data.id_list))
            setLoading(false)
        }).catch((error) => {
                setLoading(false)
                console.error('Error:', error)
            }
        )
}

/**
 * Send POST request to preprocessing endpoint
 * @param endpoint
 * @param formData
 * @param setFileUrl
 * @param setLoading
 * @returns {Promise<void>}
 */
export const sendPreprocessingRequest = async (endpoint, formData, setFileUrl, setLoading) => {
    setLoading(true)
    await axios.post(endpoint, formData)
        .then((response) => {
            let data = response.data
            console.log('Success:', data)
            setFileUrl(data['image_edited'])
            setLoading(false)
        }).catch((error) => {
            console.error('Error:', error)
            setLoading(false)
        })
}

/**
 * Send POST request to two preprocessing endpoints
 * @param endpoint1
 * @param endpoint2
 * @param content1
 * @param content2
 * @param setFileUrl
 * @param setLoading
 * @returns {Promise<void>}
 */
export const sendPreprocessingRequestMulti = async (endpoint1, endpoint2, content1, content2, setFileUrl, setLoading) => {
    setLoading(true)
    let formData1 = createFormData(content1)
    await axios.post(endpoint1, formData1)
        .then(async (response) => {
            let data1 = response.data
            let formData2 = createFormData({...content2, image: data1['image_edited']})
            await axios.post(endpoint2, formData2)
                .then((response) => {
                    let data2 = response.data
                    console.log('Success: ', data2)
                    setFileUrl(data2['image_edited'])
                    setLoading(false)
                })
        }).catch((error) => {
            console.error('Error:', error)
            setLoading(false)
        })
}

/**
 * Initialize default list of predictions
 * @param predictions
 * @param classList
 * @returns {[]}
 */
export const initPredictions = (predictions, classList) => {
    let data = []
    predictions.forEach((pred, id) => {
        data.push({
            name: id,
            threshold: parseInt(Math.max(...predictions)),
            percent: pred,
            class: classList[id]
        })
    })
    return data
}
/***
 * Trigger onChange event on DOM node
 * @param node
 * @param value
 */
export const triggerOnChangeEvent = (node, value) => {
    const setValue = Object.getOwnPropertyDescriptor(node?.__proto__, 'value').set
    const event = new Event('change', {bubbles: true})
    setValue.call(node, value)
    node?.dispatchEvent(event)
}

/***
 * Initialize view based on input predictView
 * @param predictView
 * @param method
 * @param modelName
 * @param endpointSingle
 * @param endpointMulti
 * @param content
 * @returns {{view: JSX.Element, title: string, helpContent: JSX.Element}}
 */
export const initView = (predictView, method, modelName, endpointSingle, endpointMulti, content) => {
    switch (predictView) {
        case PREDICT_VIEW.SINGLE:
            return {
                title: `${i18n.t("singleImage")} - ${method.toUpperCase()}`,
                helpContent: <SingleHelp method={method}/>,
                view: <PredictViewSingle modelName={modelName} endpoint={endpointSingle} content={content}/>
            }
        case PREDICT_VIEW.DRAW:
            return {
                title: `${i18n.t("drawImage")} - ${method.toUpperCase()}`,
                helpContent: <DrawHelp method={method}/>,
                view: <PredictViewDraw modelName={modelName} endpoint={endpointSingle} content={content}/>
            }
        case PREDICT_VIEW.CROP:
            return {
                title: `${i18n.t("cropImages")} - ${method.toUpperCase()}`,
                helpContent: <CropHelp method={method}/>,
                view: <PredictViewCrop modelName={modelName} endpoint={endpointMulti} content={content}/>
            }
        default:
            return {
                title: '',
                helpContent: <></>,
                view: <></>
            }
    }
}
/***
 * Format help string under model dropdown
 * @param method
 * @param pl
 * @param currenti18n
 * @returns {`${*} ${string} model${*|string}`}
 */
export const formatMessage = (method, pl = false, currenti18n) => {
    return `${currenti18n.t("constants.choose")} ${method} model${pl ? currenti18n.t("pl") : ""}`
}