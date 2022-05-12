import {CCol, CRow} from "@coreui/react";
import React, {useEffect, useState} from "react";
import {CheckGroup} from "../../form/CheckGroup";
import {HuePicker} from "react-color";
import {PREPROCESSING} from "../../../utils";
import {HelpIconTooltip} from "../../help/HelpIconTooltip";
import {ColorModeLegend} from "../../help/preprocessing/ColorModeLegend";
import i18n from "../../../translation/i18n";

/**
 * Container handling colors
 * @param setColor - method to update color
 * @param setColorMode - method to update color mode
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ColorMode = React.forwardRef(({setColor, setColorMode}, ref) => {

    const CM = PREPROCESSING.COLOR_MODE
    
    let colorRadioInit = [
        {
            name: "color_mode",
            value: CM.RGB,
            id: CM.RGB,
            checked: true,
            label: "RGB",
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "color_mode",
            value: CM.GREYSCALE,
            id: CM.GREYSCALE,
            checked: false,
            label: i18n.t("constants.preprocessing.greyscale"),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "color_mode",
            value: CM.SEPIA,
            id: CM.SEPIA,
            checked: false,
            label: "Sepia",
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "color_mode",
            value: CM.INVERT,
            id: CM.INVERT,
            checked: false,
            label: i18n.t("constants.preprocessing.invert"),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "color_mode",
            value: CM.CUSTOM,
            id: CM.CUSTOM,
            checked: false,
            label: i18n.t("constants.preprocessing.custom"),
            onChange: (e) => setSelected(e.target.id)
        }
    ]

    const [colorModes, setColorModes] = useState(colorRadioInit)
    const [selected, setSelected] = useState(CM.RGB)
    const [rgba, setRgba] = useState('#fff')

    const updateColor = (e) => {
        const rgba = e.rgb
        setRgba({...rgba, r: rgba.r, g: rgba.g, b: rgba.b})
    }

    useEffect(() => {
        setColorMode(selected)
        setColorModes(
            colorModes.map(
                (item) => ({...item, checked: item.id === selected})
            )
        )
    }, [selected]);
    useEffect(() => setColor(rgba), [rgba])

    React.useImperativeHandle(ref, () => ({
        clear() {
            setColorModes(colorRadioInit)
            setSelected(CM.RGB)
            setRgba('#fff')
        }
    }))

    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mb-3 h5'}>{i18n.t("preprocessingForm.colorMode")}</span>
                <span className={'mx-2'}><HelpIconTooltip content={<ColorModeLegend/>} title={i18n.t("preprocessingForm.colorMode")} height={20} modalSize={'xl'}/></span>
            </h6>
            <CheckGroup type="radio" radioItems={colorModes} direction={"horizontal"}/>

            {selected === CM.CUSTOM &&
                (<>
                    <h5 className="mt-2">Pick color</h5>
                    <CRow className={'m-2 text-center mt-2 justify-content-center mx-auto'}>
                        <CCol lg={3}>Hue</CCol>
                       <HuePicker color={rgba} onChange={updateColor} className={'col-lg-4'}/>
                    </CRow>
                </>)
            }
        </>
    )

})