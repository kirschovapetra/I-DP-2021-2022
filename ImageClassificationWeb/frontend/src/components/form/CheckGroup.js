import React from "react";
import {CFormCheck, CFormSwitch} from "@coreui/react";

/**
 * Group of checkbox/radio/switch form elements
 * @param type - checkbox/radio/switch
 * @param radioItems - input data for radio items
 * @param direction - horizontal/vertical
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CheckGroup = ({type, radioItems, direction}) => {
    return (
        <div className="mb-3">
            {
                radioItems.map(
                    (item, key) =>
                        (
                            type === 'switch'
                                ? <CFormSwitch id={item.id} name={item.name} checked={item.checked} value={item.value}
                                               onChange={item.onChange} label={item.label} key={key}
                                               className={'justify-content-center switch-center'} style={{marginRight: '2%'}}/>
                                : <CFormCheck type={type} id={item.id} name={item.name} checked={item.checked} value={item.value}
                                              onChange={item.onChange} label={item.label} key={key} inline={direction === "horizontal"}/>)
                )
            }
        </div>

    );
}
