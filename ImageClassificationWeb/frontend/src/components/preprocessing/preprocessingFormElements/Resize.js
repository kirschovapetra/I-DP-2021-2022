import React, {useEffect, useState} from "react";
import {InputGroup} from "../../form/InputGroup";
import {PREPROCESSING} from "../../../utils";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {ResizeLegend} from "../../help/preprocessing/ResizeLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling resizing
 * @param setDimensions - method to update dimensions
 * @param dimensions - image dimensions
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Resize = React.forwardRef(({setDimensions, dimensions}, ref) => {

    const heightInit = {
        name: PREPROCESSING.HEIGHT,
        id: PREPROCESSING.HEIGHT,
        value: null,
        checked: false,
        type: 'number',
        label: i18n.t("constants.preprocessing.height"),
        onChange: (e) => {
            setHeight({...height, value: e.target.value})
            if (!changed) setChanged(true)
        }
    }
    const widthInit = {
        name: PREPROCESSING.WIDTH,
        id: PREPROCESSING.WIDTH,
        value: null,
        checked: false,
        type: 'number',
        label: i18n.t("constants.preprocessing.width"),
        onChange: (e) => {
            setWidth({...width, value: e.target.value})
            if (!changed) setChanged(true)
        }
    }

    const [height, setHeight] = useState(heightInit)
    const [width, setWidth] = useState(widthInit)
    const [changed, setChanged] = useState(null)

    useEffect(() => {
        if (changed === null) {
            setWidth({...width, value: dimensions?.width})
            setHeight({...height, value: dimensions?.height})
        }
    }, [dimensions])

    useEffect(() => {
        if (changed === null) return
        setDimensions({height: parseFloat(height.value), width: parseFloat(width.value)})
    }, [height, width])

    React.useImperativeHandle(ref, () => ({
        clear() {
            setHeight(heightInit)
            setWidth(widthInit)
            setChanged(null)
        }
    }))

    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mt-2 h5'}>{i18n.t("preprocessingForm.resize")}</span>
                <span className={'mx-2'}><HelpIconTooltip content={<ResizeLegend/>} title={i18n.t("preprocessingForm.resize")} height={20}/></span>
            </h6>
            <InputGroup inputs={[height, width]} labelSize={4}/>
        </>
    );
})
