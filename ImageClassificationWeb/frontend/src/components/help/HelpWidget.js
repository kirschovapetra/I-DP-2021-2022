import React, {useState} from "react";
import {CCardHeader, CLink, CTooltip, CWidgetStatsF} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {cilArrowRight, cilChartPie, cilInfo} from "@coreui/icons";
import {HelpModal} from "./HelpModal";
import i18n from "../../translation/i18n";

/***
 *
 * @param color - widget color
 * @param title - widget title
 * @param icon - widget icon
 * @param content - widget content
 * @param modalSize - modal size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const HelpWidget = ({color = 'primary', title, icon, content, modalSize}) => {

    const [modalShow, setModalShow] = useState(false)

    return (
        <>
            <CWidgetStatsF className="mb-3" color={color} padding={false} icon={<CIcon icon={icon} height={24}/>}
                           value={<span className={'pr-2'}>{title || i18n.t("help.title")}</span>}
                           footer={
                               <div className="font-weight-bold font-xs text-medium-emphasis" onClick={() => setModalShow(true)}>
                                   {i18n.t("help.details")}
                                   <CIcon icon={cilArrowRight} className="float-end" width={16}/>
                               </div>
                           }/>
            <HelpModal show={modalShow} title={title || i18n.t("help.title")} onHide={() => setModalShow(false)} content={content} size={modalSize}/>
        </>
    )
}