import React, {useEffect, useState} from "react";
import {InputMixGroup} from "../../../form/InputMixGroup";
import {PREPROCESSING} from "../../../../utils";
import i18n from "../../../../translation/i18n";

/**
 * Bilateral means denoise view
 * @param setChangedDenoise - method to invoke denoise changed
 * @param setDenoiseRequest - method to change denoise POST request
 * @param denoiseRadioItems - data for Radio form items
 * @param selected - TV-Chambolle is selected (bool)
 * @param imageId - image identificator
 * @param resetLoadingBar - function to reset loading bar
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const DenoiseBilateral = React.forwardRef(({setChangedDenoise, setDenoiseRequest, denoiseRadioItems, selected, imageId, resetLoadingBar}, ref) => {

    const D = PREPROCESSING.DENOISE

    const changeDenoiseBilateral = (e) => {
        resetLoadingBar()
        setBilateralOptions({
                inputs:
                    bilateralOptions.inputs.map(
                        (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
                    ),
                selects:
                    bilateralOptions.selects.map(
                        (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
                    ),
            }
        )
    }
    const bilateralInit = {
        inputs: [
            {
                type: "number",
                id: D.WINDOW_SIZE,
                name: D.WINDOW_SIZE,
                value: 10,
                label: i18n.t("constants.preprocessing.windowSize"),
                onChange: changeDenoiseBilateral
            },
            {
                type: "number",
                id: D.SIGMA_COLOR,
                name: D.SIGMA_COLOR,
                label: i18n.t("constants.preprocessing.sigmaColor"),
                value: 0.15,
                onChange: changeDenoiseBilateral
            },
            {
                type: "number",
                id: D.SIGMA_SPATIAL,
                name: D.SIGMA_SPATIAL,
                label: i18n.t("constants.preprocessing.sigmaSpatial"),
                value: 15,
                onChange: changeDenoiseBilateral
            },
            {
                type: "number",
                id: D.BINS,
                name: D.BINS,
                label: i18n.t("constants.preprocessing.bins"),
                value: 10,
                onChange: changeDenoiseBilateral
            }
        ],
        selects: [
            {
                id: D.BILATERAL_MODE,
                name: D.BILATERAL_MODE,
                label: i18n.t("constants.preprocessing.mode"),
                value: "constant",
                onChange: changeDenoiseBilateral,
                options: [
                    {value: "constant"},
                    {value: "edge"},
                    {value: "symmetric"},
                    {value: "reflect"},
                    {value: "wrap"},
                ]
            }
        ]
    }
    const [bilateralOptions, setBilateralOptions] = useState(bilateralInit)
    useEffect(() => {
        if (!imageId) return
        if (selected !== "bilateral") return

        const content = {
            'image': localStorage.getItem(imageId),
            'denoise_mode': selected,
            "sigma_color": bilateralOptions.inputs.filter((item) => (item.id === D.SIGMA_COLOR))[0].value,
            "win_size": bilateralOptions.inputs.filter((item) => (item.id === D.WINDOW_SIZE))[0].value,
            "sigma_spatial": bilateralOptions.inputs.filter((item) => (item.id === D.SIGMA_SPATIAL))[0].value,
            "bins": bilateralOptions.inputs.filter((item) => (item.id === D.BINS))[0].value,
            "bilateral_mode": bilateralOptions.selects.filter((item) => (item.id === D.BILATERAL_MODE))[0].value
        }
        setChangedDenoise(true)
        setDenoiseRequest(content)

    }, [denoiseRadioItems, bilateralOptions]);

    React.useImperativeHandle(ref, () => ({
        clear() {
            setBilateralOptions(bilateralInit)
        }
    }))

    return (
        <>
            <InputMixGroup inputs={bilateralOptions.inputs} selects={bilateralOptions.selects} labelSize={5}/>
        </>
    )
})