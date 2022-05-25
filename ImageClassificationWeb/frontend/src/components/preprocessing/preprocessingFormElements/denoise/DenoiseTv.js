import React, {useEffect, useState} from "react";
import {InputGroup} from "../../../form/InputGroup";
import {PREPROCESSING} from "../../../../utils";
import i18n from "../../../../translation/i18n";

/**
 * TV Chambolle denoise view
 * @param setChangedDenoise - method to invoke denoise changed
 * @param setDenoiseRequest - method to change denoise POST request
 * @param denoiseRadioItems - data for Radio form items
 * @param selected - TV-Chambolle is selected (bool)
 * @param imageId - image identificator
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const DenoiseTv = React.forwardRef(({setChangedDenoise, setDenoiseRequest, denoiseRadioItems, selected, imageId}, ref) => {

    const D = PREPROCESSING.DENOISE

    const changeDenoiseTvChambolle = (e) => {
        setTvChambolleOptions(
            tvChambolleOptions.map(
                (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
            )
        )
    }
    const tvInit = [
        {
            type: "number",
            id: D.WEIGHT,
            name: D.WEIGHT,
            label: i18n.t("constants.preprocessing.weight"),
            value: 0.1,
            onChange: changeDenoiseTvChambolle
        },
        {
            type: "number",
            id: D.EPS,
            name: D.EPS,
            label: "Eps",
            value: 0.0002,
            onChange: changeDenoiseTvChambolle
        },
        {
            type: "number",
            id: D.N_ITER_MAX,
            name: D.N_ITER_MAX,
            label: i18n.t("constants.preprocessing.maxIter"),
            value: 200,
            onChange: changeDenoiseTvChambolle
        },
    ]
    const [tvChambolleOptions, setTvChambolleOptions] = useState(tvInit)

    useEffect(() => {
        if (!imageId) return
        if (selected !== "tv_chambolle") return

        const content = {
            'image': localStorage.getItem(imageId),
            'denoise_mode': selected,
            "eps": tvChambolleOptions.filter((item) => (item.id === D.EPS))[0].value,
            "n_iter_max": tvChambolleOptions.filter((item) => (item.id === D.N_ITER_MAX))[0].value,
            "weight": tvChambolleOptions.filter((item) => (item.id === D.WEIGHT))[0].value
        }
        setChangedDenoise(true)
        setDenoiseRequest(content)

    }, [denoiseRadioItems, tvChambolleOptions]);

    React.useImperativeHandle(ref, () => ({
        clear() {
            setTvChambolleOptions(tvInit)
        }
    }))

    return (
        <>
            <InputGroup inputs={tvChambolleOptions} labelSize={5}/>
        </>
    )
})