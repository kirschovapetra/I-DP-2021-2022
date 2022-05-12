import React from "react";
import {CButton, CSpinner} from "@coreui/react";
import CIcon from "@coreui/icons-react";

/**
 * Button with CIcon
 * @param color - button color
 * @param className - button class name
 * @param disabled - button disabled state
 * @param onClick - on click action
 * @param showSpinner - show or hide spinner
 * @param icon - icon type
 * @param value - button text
 * @param size - button size
 * @param iconSize - icon size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ButtonWithIcon = ({color, className, disabled, onClick, showSpinner, icon, value, size, iconSize='lg'}) => {
    return (
        <>
            <CButton color={color} className={className} disabled={disabled} onClick={onClick} size={size} shape="rounded-pill">
                {showSpinner ? <CSpinner className={'chart-spinner me-2'} component="span" size="sm" aria-hidden="true"/>
                    : <CIcon icon={icon} className={value ? "me-2" : ""} size={iconSize}/>}
                {value}
            </CButton>
        </>
    );
}