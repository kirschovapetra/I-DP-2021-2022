import React, {useEffect, useState} from "react";
import {CFormRange} from "@coreui/react";
import {PREPROCESSING} from "../../../utils";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {BrightnessLegend} from "../../help/preprocessing/BrightnessLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling brightness
 * @param setBrightness - method to update brightness
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Brightness = React.forwardRef(({setBrightness}, ref) => {

    const gammaInit = {
        id: PREPROCESSING.BRIGHTNESS,
        name: PREPROCESSING.BRIGHTNESS,
        min: -1,
        max: 1,
        value: 0,
        step: 0.1,
        style: {direction: "ltr"},
        label: i18n.t("constants.preprocessing.brightness"),
        onChange: (e) => {
            setGamma({...gamma, value: e.target.value})
            if (!changed) setChanged(true)
        }
    }

    const [changed, setChanged] = useState(null)
    const [gamma, setGamma] = useState(gammaInit)


    useEffect(() => {
        if (changed == null) return
        setBrightness(parseFloat(gamma.value))
    }, [gamma])

     React.useImperativeHandle(ref, () => ({
        clear() {
            setGamma(gammaInit)
        }
    }))


    return (

        <>
            <h6 className="mt-2 text-center">
                <span className={'mt-2 h5'}>{gamma.label} : <b>{gamma.value}</b></span>
                <span className={'mx-2'}><HelpIconTooltip content={<BrightnessLegend/>} title={gamma.label} height={20} modalSize={'lg'}/></span>
            </h6>
            <CFormRange id={gamma.id} name={gamma.name} min={gamma.min} max={gamma.max} value={gamma.value}
                        step={gamma.step} style={gamma.style} onChange={gamma.onChange}/>
        </>

    );
})

