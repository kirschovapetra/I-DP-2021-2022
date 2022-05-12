import React, {useEffect, useState} from "react";
import {CFormRange} from "@coreui/react";
import {PREPROCESSING} from "../../../utils";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {RotationLegend} from "../../help/preprocessing/RotationLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling rotation
 * @param setRotation - method to update rotation
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Rotation = React.forwardRef(({setRotation}, ref) => {

    const angleInit = {
        id: PREPROCESSING.ROTATION,
        name: PREPROCESSING.ROTATION,
        min: -360,
        max: 360,
        value: 0,
        step: 1,
        style: {direction: "ltr"},
        label: i18n.t("constants.preprocessing.rotation"),
        onChange: (e) => {
            setAngle({...angle, value: e.target.value})
            if (!changed) setChanged(true)
        }
    }

    const [changed, setChanged] = useState(null)
    const [angle, setAngle] = useState(angleInit)

    useEffect(() => {
        if (changed == null) return
        setRotation(parseFloat(angle.value))
    }, [angle])

    React.useImperativeHandle(ref, () => ({
        clear() {
            setAngle(angleInit)
        }
    }))

    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mt-2 h5'}>{angle.label} : <b>{angle.value}</b></span>
                <span className={'mx-2'}><HelpIconTooltip content={<RotationLegend/>} title={angle.label} height={20}/></span>
            </h6>
            <CFormRange id={angle.id} name={angle.name} min={angle.min} max={angle.max} value={angle.value}
                        step={angle.step} style={angle.style} onChange={angle.onChange}/>
        </>
    );
})

