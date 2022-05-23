import React, {useRef} from "react";
import {CButton, CForm, CModal, CModalBody, CModalHeader, CModalFooter, CModalTitle} from "@coreui/react"
import {PreprocessingForm} from "./PreprocessingForm";
import i18n from "../../translation/i18n";


/**
 * Modal displaying PreprocessingForm
 * @param show - bool
 * @param onShow - method to be executed on show
 * @param onHide - method to be executed on hide
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
export const PreprocessingModal = ({show, onShow, onHide, imageSrc, fileUrl, setFileUrl, setEditFileUrl, imageId, imageSize, imageSizeOriginal, updateDimensions}) => {

    const formRef = useRef()

    return (
        <CModal visible={show} onShow={()=>{
            onShow()
            formRef.current?.clearForm()
        }} onClose={onHide} size="xl" alignment={'center'} scrollable={true} portal={false}>
            <CModalHeader closeButton>
                <CModalTitle id="contained-modal-title-vcenter">
                    {i18n.t("preprocessingForm.preprocessing")}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={{padding: "3%"}}>
                <PreprocessingForm
                    ref={formRef}
                    imageSrc={imageSrc}
                    fileUrl={fileUrl}
                    setFileUrl={setFileUrl}
                    setEditFileUrl={setEditFileUrl}
                    imageId={imageId}
                    imageSize={imageSize}
                    imageSizeOriginal={imageSizeOriginal}
                    updateDimensions={updateDimensions}/>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" type="reset" onClick={() => formRef.current?.clearForm()}>Reset</CButton>
                <CButton onClick={onHide}>{i18n.t("preprocessingForm.done")}</CButton>
            </CModalFooter>
        </CModal>
    );
}
