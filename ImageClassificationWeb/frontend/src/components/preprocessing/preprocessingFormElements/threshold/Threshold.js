import React, {useEffect, useRef, useState} from "react";
import {CheckGroup} from "../../../form/CheckGroup";
import {ThresholdAdaptive} from "./ThresholdAdaptive";
import {PREPROCESSING} from "../../../../utils";
import {HelpIconTooltip} from "../../../help/HelpIconTooltip";
import {ThresholdLegend} from "../../../help/preprocessing/ThresholdLegend";
import i18n from "../../../../translation/i18n";

/**
 * Container handling image threshold
 * @param setThresholdRequest - method to set threshold request
 * @param setChangedThreshold - method to invoke threshold changed
 * @param imageId - image identificator
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Threshold = React.forwardRef(({setThresholdRequest, setChangedThreshold, imageId}, ref) => {

    const TM = PREPROCESSING.THRESHOLD.THRESHOLD_MODE

    const [selected, setSelected] = useState(TM.NONE_THR)

    const adaptRef = useRef()

    let thresholdRadioInit = [
        {
            name: "threshold_mode",
            value: TM.NONE_THR,
            id: TM.NONE_THR,
            checked: true,
            label: i18n.t("constants.preprocessing.none"),
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "threshold_mode",
            value: TM.OTSU,
            id: TM.OTSU,
            checked: false,
            label: "Otsu",
            onChange: (e) => setSelected(e.target.id)
        },
        {
            name: "threshold_mode",
            value: TM.ADAPTIVE,
            id: TM.ADAPTIVE,
            checked: false,
            label: i18n.t("constants.preprocessing.adaptive"),
            onChange: (e) => setSelected(e.target.id)
        }
    ]
    const [thresholdRadioItems, setThresholdRadioItems] = useState(thresholdRadioInit)


    useEffect( () => {
        let currentFileUrl = localStorage.getItem(imageId)
        if (!currentFileUrl) return


        const content = {'image': currentFileUrl, 'threshold_mode': selected}

        if (selected === TM.NONE_THR) setChangedThreshold(false)
        else if (selected === TM.OTSU) setChangedThreshold(true)

        setThresholdRequest(content)
        setThresholdRadioItems(
            thresholdRadioItems.map(
                (item) => ({...item, checked: item.id === selected})
            )
        )
    }, [selected]);

    React.useImperativeHandle(ref, () => ({
        clear() {
            try {
                adaptRef.current?.clear()
            } catch (e) {
            }
            setThresholdRadioItems(thresholdRadioInit)
            setSelected(TM.NONE_THR)
        }
    }))

    return (
        <>
            <h6 className="mt-2 text-center">
                <span className={'mb-3 h5'}>{i18n.t("preprocessingForm.threshold")}</span>
                <span className={'mx-2'}><HelpIconTooltip content={<ThresholdLegend/>} title={i18n.t("preprocessingForm.threshold")} height={20} modalSize={'lg'}/></span>
            </h6>
            <CheckGroup type="radio" radioItems={thresholdRadioItems} direction={"horizontal"}/>
            {
                selected === TM.ADAPTIVE && <ThresholdAdaptive ref={adaptRef} selected={selected} setThresholdRequest={setThresholdRequest} imageId={imageId}
                                                               thresholdRadioItems={thresholdRadioItems} setChangedThreshold={setChangedThreshold}/>
            }

        </>
    )
})