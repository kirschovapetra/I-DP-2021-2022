import React, {useEffect, useState} from "react";
import {CFormRange} from "@coreui/react";
import {PREPROCESSING} from "../../../utils";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {ContrastLegend} from "../../help/preprocessing/ContrastLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling contrast
 * @param setContrast - method to update contrast
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Contrast = React.forwardRef(({setContrast}, ref) => {

    const contrastRangeInit = {
        id: PREPROCESSING.CONTRAST,
        name: PREPROCESSING.CONTRAST,
        min: -1,
        max: 1,
        value: 0,
        step: 0.1,
        style: {direction: "ltr"},
        label: i18n.t("constants.preprocessing.contrast"),
        onChange: (e) => {
            setContrastRange({...contrastRange, value: e.target.value})
            if (!changed) setChanged(true)
        }
    }

    const [changed, setChanged] = useState(null)
    const [contrastRange, setContrastRange] = useState(contrastRangeInit)


    useEffect(() => {
        if (changed == null) return
        setContrast(parseFloat(contrastRange.value))
    }, [contrastRange])

    React.useImperativeHandle(ref, () => ({
        clear() {
            setContrastRange(contrastRangeInit)
        }
    }))

    return (

        <>
             <h6 className="mt-2 text-center">
                <span className={'mt-2 h5'}>{contrastRange.label} : <b>{contrastRange.value}</b></span>
                <span className={'mx-2'}><HelpIconTooltip content={<ContrastLegend/>} title={contrastRange.label} height={20} modalSize={'lg'}/></span>
            </h6>
            <CFormRange id={contrastRange.id} name={contrastRange.name} min={contrastRange.min} max={contrastRange.max} value={contrastRange.value}
                       step={contrastRange.step} style={contrastRange.style} onChange={contrastRange.onChange}/>
        </>

    );
})

