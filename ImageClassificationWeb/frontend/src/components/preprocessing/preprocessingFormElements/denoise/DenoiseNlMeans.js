import React, {useEffect, useState} from "react";
import {InputGroup} from "../../../form/InputGroup";
import {PREPROCESSING} from "../../../../utils";
import i18n from "../../../../translation/i18n";

/**
 * Non-local means denoise view
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
export const DenoiseNlMeans = React.forwardRef(({setChangedDenoise, setDenoiseRequest, denoiseRadioItems, selected, imageId, resetLoadingBar}, ref) => {

    const D = PREPROCESSING.DENOISE

    const changeDenoiseNlMeans = (e) => {
        resetLoadingBar()
        setNlMeansOptions(
            nlMeansOptions.map(
                (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
            )
        )
    }
    const nlInit = [
        {
            type: "number",
            id: D.PATCH_SIZE,
            name: D.PATCH_SIZE,
            label: i18n.t("constants.preprocessing.patchSize"),
            value: 5,
            onChange: changeDenoiseNlMeans
        },
        {
            type: "number",
            id: D.PATCH_DISTANCE,
            name: D.PATCH_DISTANCE,
            label: i18n.t("constants.preprocessing.patchDist"),
            value: 6,
            onChange: changeDenoiseNlMeans
        }
    ]
    const [nlMeansOptions, setNlMeansOptions] = useState(nlInit)
    useEffect(() => {
        if (!imageId) return
        if (selected !== "nl_means") return
        const content = {
            'image': localStorage.getItem(imageId),
            'denoise_mode': selected,
            "patch_size": nlMeansOptions.filter((item) => (item.id === D.PATCH_SIZE))[0].value,
            "patch_distance": nlMeansOptions.filter((item) => (item.id === D.PATCH_DISTANCE))[0].value
        }
        setChangedDenoise(true)
        setDenoiseRequest(content)
    }, [denoiseRadioItems, nlMeansOptions]);

    React.useImperativeHandle(ref, () => ({
        clear() {
            setNlMeansOptions(nlInit)
        }
    }))

    return (
        <>
            <InputGroup inputs={nlMeansOptions} labelSize={5}/>
        </>
    )
})