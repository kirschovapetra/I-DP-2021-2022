import React, {useEffect, useState} from "react";
import {CheckGroup} from "../../form/CheckGroup";
import {PREPROCESSING} from "../../../utils";
import {CRow} from "@coreui/react";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {FlipLegend} from "../../help/preprocessing/FlipLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling flip
 * @param setFlip - method to update flip
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Flip = React.forwardRef(({setFlip}, ref) => {
    const horizontalInit = {
        name: "flip",
        id: PREPROCESSING.HORIZONTAL,
        value: PREPROCESSING.HORIZONTAL,
        checked: false,
        label: i18n.t("constants.preprocessing.horizontal"),
        onChange: (e) => {
            setHorizontal({...horizontal, checked: e.target.checked})
            if (!changed) setChanged(true)
        }
    }
    const verticalInit = {
        name: "flip",
        id: PREPROCESSING.VERTICAL,
        value: PREPROCESSING.VERTICAL,
        checked: false,
        label: i18n.t("constants.preprocessing.vertical"),
        onChange: (e) => {
            setVertical({...vertical, checked: e.target.checked})
            if (!changed) setChanged(true)
        }
    }

    const [horizontal, setHorizontal] = useState(horizontalInit)
    const [vertical, setVertical] = useState(verticalInit)
    const [changed, setChanged] = useState(null)

    useEffect(() => {
        if (changed === null) return
        setFlip({horizontal: horizontal.checked, vertical: vertical.checked})
    }, [horizontal, vertical])

    React.useImperativeHandle(ref, () => ({
        clear() {
            setHorizontal(horizontalInit)
            setVertical(verticalInit)
        }
    }))


    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mt-2 h5'}>{i18n.t("preprocessingForm.flip")}</span>
                <span className={'mx-2'}><HelpIconTooltip content={<FlipLegend/>} title={i18n.t("preprocessingForm.flip")} height={20} modalSize={'lg'}/></span>
            </h6>
            <CRow className={'text-center mx-auto justify-content-center'}>
                <CheckGroup type="switch" radioItems={[horizontal, vertical]} direction={"horizontal"}/>
            </CRow>
        </>

    );
})
