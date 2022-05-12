import React, {useState} from "react";
import {CCardHeader, CTooltip} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {cilInfo} from "@coreui/icons";
import {HelpModal} from "./HelpModal";
import i18n from "../../translation/i18n";

/***
 * Help icon with tooltip and modal
 * @param message - message shown on the tooltip
 * @param title - modal title
 * @param content - modal content
 * @param height - icon height
 * @param modalSize - modal size
 * @returns {JSX.Element}
 * @constructor
 */
export const HelpIconTooltip = ({message, title, content, height=30, modalSize}) => {

    const [modalShow, setModalShow] = useState(false)

    return (
        <>
            <CTooltip content={message || i18n.t("help.message")} placement={'bottom'}>
                <CIcon icon={cilInfo} size="lg" height={height} className={'info-icon p-0 m-0 pointer'} onClick={() => setModalShow(true)}/>
            </CTooltip>
            <HelpModal show={modalShow} title={title || i18n.t("help.title")} onHide={() => setModalShow(false)} content={content} size={modalSize}/>
        </>
    )
}