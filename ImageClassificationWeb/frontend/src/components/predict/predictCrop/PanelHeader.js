import {CCol, CForm, CRow, CFormCheck} from "@coreui/react";
import {cilChevronCircleUpAlt, cilChevronCircleDownAlt, cilChevronBottom, cilChevronTop} from '@coreui/icons'
import React, {useEffect, useState} from "react";
import CIcon from '@coreui/icons-react'
import {ImagePreview} from "../ImagePreview";
import {PreprocessingModal} from "../../preprocessing/PreprocessingModal";
import i18n from "../../../translation/i18n";


/**
 * Header of a single CropList item
 * @param expanded - bool
 * @param toggleExpanded - function to open/close details
 * @param cropItemSingle - single cropped image data
 * @param updateImageFileUrl - method to update image file URL
 * @param updateSize - method to update image size
 * @param id - item id
 * @returns {JSX.Element}
 * @constructor
 * @component
 */

export const PanelHeader = ({expanded, toggleExpanded, cropItemSingle, updateImageFileUrl, updateDimensions, id}) => {

    const getThumbnailSize = (originalDim) => {
        const baseDim = 100
        return originalDim < baseDim ? baseDim : originalDim
    }

    let data = cropItemSingle.objectData;
    let imageSrc = data?.canvasElement?.toDataURL()
    let cropData = JSON.parse(data?.crop)
    let dimensions = {
        height: Math.round(cropData.h),
        width: Math.round(cropData.w),
        hThumb: getThumbnailSize(Math.round(cropData.h)),
        wThumb: getThumbnailSize(Math.round(cropData.w)),
    }
    const [modalShow, setModalShow] = useState(false)
    const [fileUrl, setFileUrl] = useState('')
    const [editFileUrl, setEditFileUrl] = useState('')

    useEffect(() => {
        localStorage.setItem(data?.objectId, editFileUrl)
        setFileUrl(imageSrc)
        setEditFileUrl(imageSrc)
    }, [imageSrc])


    useEffect(() => updateImageFileUrl(editFileUrl, data?.objectId), [editFileUrl])

    return (
        <>
            {
                imageSrc && (
                    <CRow>
                        <CCol md={1}>
                            <CFormCheck
                                type={'checkbox'} id={data?.objectId} name={data?.objectId} value={data?.objectId}
                                checked={cropItemSingle.checked} onChange={cropItemSingle.onChange}
                            />
                        </CCol>
                        <CCol md={4}>
                            <ImagePreview fileUrl={fileUrl} height={100} width={100} iconSize={25} setModalShow={setModalShow}
                                          imageStyle={{objectFit: 'contain'}}/>
                        </CCol>
                        <CCol md={5} className={'text-start'}>
                            <CRow><p>{dimensions.width}x{dimensions.height}</p></CRow>
                            {
                                cropItemSingle.result !== undefined &&
                                <CRow className={'primary-text'}>
                                    <b>{i18n.t("predict.result")}: {cropItemSingle.result}</b>
                                </CRow>
                            }
                        </CCol>
                        <CCol md={1}>
                            {
                                cropItemSingle.result !== undefined && cropItemSingle.pred_list &&
                                (expanded === true
                                        ? <div onClick={() => toggleExpanded(id, false)}><CIcon icon={cilChevronTop} size={'xl'}/></div>
                                        : <div onClick={() => toggleExpanded(id, true)}><CIcon icon={cilChevronBottom} size={'xl'}/></div>
                                )
                            }
                        </CCol>
                    </CRow>
                )
            }
            <PreprocessingModal
                show={modalShow}
                onShow={() => {
                    if (data) localStorage.setItem(data.objectId, fileUrl)
                }}
                onHide={() => {
                    setModalShow(false)
                    setFileUrl(editFileUrl)
                    if (data) localStorage.setItem(data.objectId, editFileUrl)
                }}
                imageSrc={imageSrc}
                fileUrl={fileUrl}
                setFileUrl={setFileUrl}
                setEditFileUrl={setEditFileUrl}
                imageId={data?.objectId}
                imageSizeOriginal={{height: 100, width: 100}}
                imageSize={{height: dimensions.height, width: dimensions.width}}
                updateDimensions={updateDimensions}
            />
        </>
    )
}