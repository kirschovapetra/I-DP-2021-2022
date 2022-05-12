import {CCol, CFormCheck, CRow} from "@coreui/react";
import {CropListItem} from "./CropListItem";
import React, {useEffect, useState} from "react";
import {Panel, PanelGroup} from "rsuite";
import {createFormData, getWindowDimensions, sendPredictRequest} from "../../../utils";
import {ButtonWithIcon} from "../../form/ButtonWithIcon";
import {cilBarChart} from "@coreui/icons";

import 'rsuite/dist/rsuite.min.css';
import i18n from "../../../translation/i18n";

/**
 * Panel displaying list of cropped images
 * @param cropList - list of cropped image data
 * @param modelName - name of ML model for predictions
 * @param endpoint - endpoint for predictions
 * @param content - extension of form data (optional)
 * @param setColorMap - method to set color map
 * @param setResultMap - method to set result map
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CropList = ({cropList, modelName, endpoint, content, setColorMap, setResultMap}) => {
    const [checkedObjectIds, setCheckedObjectIds] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [cropListItems, setCropListItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    const toggleActive = (objectId) => {
        setCheckedObjectIds(
            checkedObjectIds.includes(objectId)
                ? checkedObjectIds.filter(item => item !== objectId)     // remove
                : [...checkedObjectIds, objectId]                        // add
        )
    }

    const getExistingCropItem = (objectId) => {
        let res = cropListItems.filter((itm) => itm.objectData.objectId === objectId)
        return res[0] || null
    }

    const mapPredictResults = (resultClasses, predLists, classLists, idList) => {
        let cropListItemsTemp = [...cropListItems]

        for (let i = 0; i < resultClasses.length; i++) {
            cropListItemsTemp.forEach((itm) => {
                if (itm.objectData?.objectId === idList[i]) {
                    itm.pred_list = predLists[i].map((itm) => parseFloat(itm?.toFixed(2)))
                    itm.classes = classLists[i]
                    itm.result = resultClasses[i]
                }
            })
        }
        setCropListItems(cropListItemsTemp)
    }

    const toggleExpanded = (id, value) => {
        let cropListItemsTmp = [...cropListItems]
        cropListItemsTmp[id].expanded = value
        setCropListItems(cropListItemsTmp)
    }

    const updateImageFileUrl = (editFileUrl, objectId) => {
        setCropListItems(
            cropListItems.map(
                (itm) => {
                    return (itm.objectData?.objectId === objectId) ? {...itm, fileUrl: editFileUrl} : itm
                }
            )
        )
    }


    const updateDimensions = (newDim, objectId) => {
        setCropListItems(
            cropListItems.map(
                (itm) => {
                    let objectData = itm.objectData
                    let cropData = JSON.parse(objectData?.crop)

                    if (itm.objectData?.objectId === objectId) {
                        cropData.h = newDim.height
                        cropData.w = newDim.width
                        objectData.crop = JSON.stringify(cropData)
                        return {...itm, objectData: objectData}
                    }
                    return itm
                }
            )
        )
    }

    const predictSelected = async () => {

        let selectedItems = cropListItems.filter((itm) => checkedObjectIds.includes(itm.objectData?.objectId));
        let selectedDataUrls = selectedItems.map((itm) => itm.fileUrl)
        let selectedIds = selectedItems.map((itm) => itm.objectData?.objectId)


        const formData = createFormData({
            ...content,
            'image_list': JSON.stringify(selectedDataUrls),
            'id_list': JSON.stringify(selectedIds),
            'model_name': modelName
        })

        await sendPredictRequest(endpoint, formData, mapPredictResults, setLoading)
    }

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let items = cropList.map((itm) => {

            let existing = getExistingCropItem(itm.objectId)

            return {
                objectData: itm,
                checked: checkedObjectIds.includes(itm.objectId),
                onChange: () => toggleActive(itm.objectId),
                loading: (existing && !itm.moved) ? existing.loading : false,
                moved: itm.moved,
                expanded: (existing && !itm.moved) ? existing.expanded : false,
                pred_list: (existing && !itm.moved) ? existing.pred_list : undefined,
                classes: (existing && !itm.moved) ? existing.classes : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                result: (existing && !itm.moved) ? existing.result : undefined,
                fileUrl: existing ? existing.fileUrl : itm.canvasElement?.toDataURL().toString()
            }
        })
        setCropListItems(items)
    }, [cropList, checkedObjectIds])

    useEffect(() => setCheckedObjectIds(selectAll ? cropList.map((itm) => itm.objectId) : []), [selectAll])

    useEffect(() => {
        setCropListItems(
            cropListItems.map(
                (itm) => ({...itm, loading: loading && itm.checked})
            )
        )
    }, [loading])

    useEffect(() => {
        let colors = new Map()
        let results = new Map()

        cropListItems.forEach((itm) => {
                colors.set(itm.objectData?.objectId, itm.pred_list ? 'lightgreen' : 'pink');
                if (itm.pred_list) {
                    let resultString = itm.result === undefined ? '' : itm.result.toString() + ": " + Math.max(...itm.pred_list).toString() + " %"
                    results.set(itm.objectData?.objectId, resultString)
                }
            }
        )
        setColorMap(colors)
        setResultMap(results)
    }, [cropListItems])

    return (
        <>
            <h2 className={'mb-2'}>{i18n.t("predict.cropResults")}</h2>
            <div className={"element scrollbar scrollbar-primary"} id="containerElement"
                 style={{height: windowDimensions.height * 0.55, overflowY: 'auto', overflowX: 'hidden'}}>
                {
                    cropListItems && cropListItems.length > 0 &&
                    (
                        <Panel className={'my-0 py-0'} id={'check-all'} eventKey={'check-all'} expanded={false}>
                            <CFormCheck type={'checkbox'} label={i18n.t("predict.selectAll")} ssize={'lg'}
                                        id={'select-all'} name={'select-all'} value={'select-all'}
                                        checked={selectAll} onChange={() => setSelectAll(!selectAll)}/>
                        </Panel>
                    )
                }
                <PanelGroup>
                    {
                        cropListItems && cropListItems.map((cropItemSingle, el) => {
                            return (
                                <CropListItem key={el} id={el} cropItemSingle={cropItemSingle} updateImageFileUrl={updateImageFileUrl}
                                              toggleExpanded={toggleExpanded} updateDimensions={updateDimensions}/>
                            )
                        })
                    }
                </PanelGroup>
            </div>
            {
                cropListItems && cropListItems.length > 0 && (
                    <CRow>
                        <CCol className={'text-center'}>
                            <ButtonWithIcon color="primary" className={'py-2 px-4'} disabled={checkedObjectIds.length === 0 || loading}
                                            onClick={predictSelected} showSpinner={loading} icon={cilBarChart}
                                            value={i18n.t("predict.predictSelectedButton")}/>
                        </CCol>
                    </CRow>
                )
            }
        </>
    )
}