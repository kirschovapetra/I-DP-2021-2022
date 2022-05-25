import {CheckGroup} from "../../../form/CheckGroup";
import React, {useEffect, useRef, useState} from "react";
import {DenoiseNlMeans} from "./DenoiseNlMeans";
import {DenoiseTv} from "./DenoiseTv";
import {DenoiseBilateral} from "./DenoiseBilateral";
import {PREPROCESSING} from "../../../../utils";
import {HelpIconTooltip} from "../../../help/HelpIconTooltip";
import {DenoiseLegend} from "../../../help/preprocessing/DenoiseLegend";
import i18n from "../../../../translation/i18n";

/**
 * Container handling inage denoising
 * @param setChangedDenoise - method to invoke denoise changed
 * @param setDenoiseRequest - method to change denoise POST request
 * @param selected - TV-Chambolle is selected (bool)
 * @param resetLoadingBar - function to reset loading bar
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Denoise = React.forwardRef(({setChangedDenoise, setDenoiseRequest, imageId, resetLoadingBar}, ref) => {

    const MODE = PREPROCESSING.DENOISE.DENOISE_MODE

    const [selected, setSelected] = useState(MODE.NONE_DEN)
    const radioInit = [
        {
            name: "denoise_mode",
            value: MODE.NONE_DEN,
            id: MODE.NONE_DEN,
            checked: true,
            label: i18n.t("constants.preprocessing.none"),
            onChange: (e) => setSelected(e.target.id)
        }, {
            name: "denoise_mode",
            value: MODE.BILATERAL,
            id: MODE.BILATERAL,
            checked: false,
            label: i18n.t("constants.preprocessing.bilateral"),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "denoise_mode",
            value: MODE.TV_CHAMBOLLE,
            id: MODE.TV_CHAMBOLLE,
            checked: false,
            label: "TV Chambolle",
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "denoise_mode",
            value: MODE.NL_MEANS,
            id: MODE.NL_MEANS,
            checked: false,
            label: "Nl-Means",
            onChange: (e) => setSelected(e.target.id)
        },

    ]
    const [denoiseRadioItems, setDenoiseRadioItems] = useState(radioInit)

    const nlRef = useRef()
    const tvRef = useRef()
    const bilRef = useRef()

    useEffect(() => {

        resetLoadingBar()

        if (selected === MODE.NONE_DEN) setChangedDenoise(false)

        setDenoiseRadioItems(
            denoiseRadioItems.map(
                (item) => ({...item, checked: item.id === selected})
            )
        )
    }, [selected]);


    const props = {
        denoiseRadioItems: denoiseRadioItems,
        selected: selected,
        setDenoiseRequest: setDenoiseRequest,
        setChangedDenoise: setChangedDenoise,
        imageId:imageId,
        resetLoadingBar:resetLoadingBar
    }


    React.useImperativeHandle(ref, () => ({
        clear() {
            nlRef.current?.clear()
            tvRef.current?.clear()
            bilRef.current?.clear()
            setDenoiseRadioItems(radioInit)
            setSelected(MODE.NONE_DEN)
        }
    }))

    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mb-3 h5'}>{i18n.t("preprocessingForm.denoise")}</span>
                <span className={'mx-2'}><HelpIconTooltip content={<DenoiseLegend/>} title={i18n.t("preprocessingForm.denoise")} height={20} modalSize={'xl'}/></span>
            </h6>
            <CheckGroup type="radio" radioItems={denoiseRadioItems} direction={"horizontal"}/>
            {
                selected === MODE.NL_MEANS ? <DenoiseNlMeans {...props} ref={nlRef}/>
                    : selected === MODE.TV_CHAMBOLLE ? <DenoiseTv {...props} ref={tvRef}/>
                        : selected === MODE.BILATERAL ? <DenoiseBilateral {...props} ref={bilRef}/>
                            : ''
            }
        </>
    )
})