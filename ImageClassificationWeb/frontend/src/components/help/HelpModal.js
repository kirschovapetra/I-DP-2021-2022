import React from "react";
import {CButton, CForm, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/react";
import {PreprocessingForm} from "../preprocessing/PreprocessingForm";
import i18n from "../../translation/i18n";

/***
 *
 * @param show - modal visibility
 * @param title - modal title
 * @param onHide - method to be executed on hide
 * @param content - modal content
 * @param size - modal size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const HelpModal = ({show, title, onHide, content, size}) => {
    return (
        <CModal visible={show} size={size} onClose={onHide} alignment={'center'} portal={false} scrollable={true}>
            <CModalHeader closeButton>
                <CModalTitle id="contained-modal-title-vcenter">{title}</CModalTitle>
            </CModalHeader>
            <CModalBody style={{padding: "3%"}}>{content}</CModalBody>
            <CModalFooter>
                <CButton color={'primary'} onClick={onHide}>{i18n.t("help.close")}</CButton>
            </CModalFooter>
        </CModal>
    )
}