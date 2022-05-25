import React, {useEffect, useState} from "react";
import {InputMixGroup} from "../../../form/InputMixGroup";
import {PREPROCESSING} from "../../../../utils";
import i18n from "../../../../translation/i18n";

/**
 * Adaptive threshold view
 * @param selected - bool
 * @param setThresholdRequest - method to change threshold POST request
 * @param thresholdRadioItems - data for Radio form items
 * @param setChangedThreshold - method to invoke threshold changed
 * @param imageId - image identificator
 * @param resetLoadingBar - function to reset loading bar
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ThresholdAdaptive = React.forwardRef(({selected, setThresholdRequest, thresholdRadioItems, setChangedThreshold, imageId, resetLoadingBar}, ref) => {

    const T = PREPROCESSING.THRESHOLD

    const changeThresholdAdaptive = (e) => {
        resetLoadingBar()

        setAdaptiveOptions({
                inputs:
                    adaptiveOptions.inputs.map(
                        (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
                    ),
                selects:
                    adaptiveOptions.selects.map(
                        (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
                    ),
                ranges:
                    adaptiveOptions.ranges.map(
                        (item) => (item.id === e.target.id ? {...item, value: e.target.value} : item)
                    ),
            }
        )
    }

    const adaptiveInit = {
        inputs: [
            {
                type: "number",
                id: T.OFFSET,
                name: T.OFFSET,
                label: "Offset",
                value: 0.05,
                onChange: changeThresholdAdaptive
            },
            {
                type: "number",
                id: T.C_VAL,
                name: T.C_VAL,
                label: "C-val",
                value: 0,
                onChange: changeThresholdAdaptive
            },
        ],
        selects: [
            {
                id: T.ADAPT_METHOD,
                name: T.ADAPT_METHOD,
                label: i18n.t("constants.preprocessing.method"),
                value: "gaussian",
                onChange: changeThresholdAdaptive,
                options: [
                    {value: "gaussian"},
                    {value: "mean"},
                    {value: "median"},
                ]
            },
            {
                id: T.ADAPT_MODE,
                name: T.ADAPT_MODE,
                label: i18n.t("constants.preprocessing.mode"),
                value: "reflect",
                onChange: changeThresholdAdaptive,
                options: [
                    {value: "reflect"},
                    {value: "constant"},
                    {value: "nearest"},
                    {value: "mirror"},
                    {value: "wrap"},
                ]
            }
        ],
        ranges: [
            {
                id: T.BLOCK_SIZE,
                name: T.BLOCK_SIZE,
                label: i18n.t("constants.preprocessing.blockSize"),
                min: 1,
                max: 201,
                step: 2,
                value: 35,
                onChange: changeThresholdAdaptive
            }
        ]
    }
    const [adaptiveOptions, setAdaptiveOptions] = useState(adaptiveInit)

    useEffect(() => {
        if (!imageId) return
        if (selected !== T.THRESHOLD_MODE.ADAPTIVE) return

        const content = {
            'image':localStorage.getItem(imageId),
            'threshold_mode': selected,
            'block_size': adaptiveOptions.ranges.filter((item) => (item.id === T.BLOCK_SIZE))[0].value,
            'adapt_method': adaptiveOptions.selects.filter((item) => (item.id === T.ADAPT_METHOD))[0].value,
            'offset': adaptiveOptions.inputs.filter((item) => (item.id === T.OFFSET))[0].value,
            'adapt_mode': adaptiveOptions.selects.filter((item) => (item.id === T.ADAPT_MODE))[0].value,
            'cval': adaptiveOptions.inputs.filter((item) => (item.id === T.C_VAL))[0].value
        }

        setChangedThreshold(true)

        setThresholdRequest(content)

    }, [thresholdRadioItems, adaptiveOptions]);

    React.useImperativeHandle(ref, () => ({
        clear() {
            setAdaptiveOptions(adaptiveInit)
        }
    }))

    return (
        <>
            <InputMixGroup inputs={adaptiveOptions.inputs} selects={adaptiveOptions.selects} ranges={adaptiveOptions.ranges} labelSize={5}/>
        </>
    )
})