import React, {lazy, useEffect, useState} from 'react'
import {CCol, CRow} from "@coreui/react";
import {UploadForm} from "../UploadForm";
import {CropList} from "../predictCrop/CropList";
import {CropCanvas} from "../predictCrop/CropCanvas";

/**
 * Core of predict view crop
 * @param modelName - name of ML model for predictions
 * @param endpoint - endpoint for predictions
 * @param content - extension of form data (optional)
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const PredictViewCrop = ({modelName, endpoint, content = {}}) => {

    const [cropListOriginal, setCropListOriginal] = useState([])
    const [cropList, setCropList] = useState([])
    const [bgFileUrl, setBgFileUrl] = useState('')
    const [colorMap, setColorMap] = useState(undefined)
    const [resultMap, setResultMap] = useState(undefined)

    useEffect(() => {
        let lang = localStorage.getItem("lang")
        localStorage.clear()
        localStorage.setItem("lang", lang)
    }, [])

    useEffect(() => {
        setCropList(
            cropListOriginal.map((itmNew) => {
                let existing = cropList.filter((itmMoved) => itmNew.objectId === itmMoved.objectId)[0]
                let moved = false

                if (existing) {
                    let existingCrop = JSON.parse(existing.crop)
                    let newCrop = JSON.parse(itmNew.crop)
                    moved = existingCrop.x !== newCrop.x || existingCrop.y !== newCrop.y
                }

                return {...itmNew, moved: moved}
            })
        )
    }, [cropListOriginal])

    return (
        <>
            <UploadForm setFileUrl={setBgFileUrl}/>
            <hr className={'my-3'}/>
            <CRow className={'pb-5'}>
                <CCol md={6} className={'mx-2'}>
                    <CropCanvas setCropListOriginal={setCropListOriginal}
                                bgImage={bgFileUrl} colorMap={colorMap} resultMap={resultMap}/>
                </CCol>
                <CCol className={'mx-2'}>
                    <CropList cropList={cropList} modelName={modelName} endpoint={endpoint}
                              content={content} setColorMap={setColorMap} setResultMap={setResultMap}/>
                </CCol>
            </CRow>
        </>
    )
}