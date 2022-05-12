import React, {useEffect, useRef, useState} from "react";
import {PredictChart} from "./PredictChart";
import {CContainer, CRow} from '@coreui/react';
import {initPredictions, triggerOnChangeEvent} from "../../utils";
import {RangeGroup} from "../form/RangeGroup";
import {HelpIconTooltip} from "../help/HelpIconTooltip";
import {ClassesLegend} from "../help/ClassesLegend";
import i18n from "../../translation/i18n";

/**
 * Container displaying prediction chart and results
 * @param predList - list of predictions
 * @param classList - lst of classes
 * @param loading - bool
 * @param height - height of chart
 * @param margin - chart margin
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const PredictResults = ({predList, classList, loading, height, margin}) => {
    const [predData, setPredData] = useState(initPredictions(predList, classList))
    const [thresholds, setThresholds] = useState(Array(10).fill(0))
    const [classes, setClasses] = useState([])
    const rangeRef = useRef()

    const thresholdRangeInit = {
        id: 'predict_threshold',
        name: 'predict_threshold',
        value: 0,
        step: 1,
        min: 0,
        max: 100,
        label: i18n.t("predict.predThreshold"),
        labelSuffix: ' %',
        text: i18n.t("constants.threshold"),
        onChange: (e) => setThresholdRange({...thresholdRange, value: e.target.value})
    }
    const [thresholdRange, setThresholdRange] = useState(thresholdRangeInit)
    const [threshChanged, setThreshChanged] = useState()
    const [dataThreshold, setDataThreshold] = useState(0)

    // classList change => update predData:class
    // predList change => update predData:percent
    useEffect(() => {
        setPredData(
            predData.map((pred, id) => {
                return {
                    ...pred,
                    percent: predList[id]?.toFixed(2),
                    class: classList[id]
                }

            })
        )
        setDataThreshold(parseInt(Math.max(...predList)))
        setThreshChanged(Date.now())
    }, [predList, classList])

    useEffect(() => {
        if (rangeRef.current) triggerOnChangeEvent(rangeRef.current, dataThreshold)
    }, [threshChanged])

    // thresholdRange change => update thresholds
    useEffect(() => setThresholds(Array(10).fill(thresholdRange.value)), [thresholdRange])

    // thresholds change => update predData:thresholds
    useEffect(() => {
        setPredData(
            predData.map((pred, id) => ({...pred, threshold: thresholds[id]}))
        )
    }, [thresholds])

    // predList/thresholdRange change => update classes
    useEffect(() => {
        setClasses(
            predList.flatMap((pred, id) => pred >= thresholdRange.value ? classList[id] : []).filter((x) => x !== undefined)
        )
    }, [predList, classList, thresholdRange])

    return (
        <CContainer className="mt-3">
            <h6 className={'text-center'}>
                <span className={'mb-3 h4'}>{i18n.t("predict.predClasses")} </span>
                <span className={'mx-2'}><HelpIconTooltip message={i18n.t("predict.showLegend")} title={i18n.t("predict.legend")} content={<ClassesLegend/>} height={23} modalSize={'lg'}/></span>
            </h6>

            <PredictChart data={predData.filter(itm => itm.class !== undefined)} loading={loading} height={height} margin={margin}/>
            {
                predData && predData.length > 0 && predData.some(e => e.percent !== 0) &&
                <>
                    <RangeGroup innerRef={rangeRef} rangeItems={[thresholdRange]} key={threshChanged}/>
                    <CRow className={'text-center mt-1 mb-3'}>
                        <h5 className="mt-3">{i18n.t("predict.result")}</h5>
                        <h5 className="mt-1 primary-text">
                            {" " + classes.map((className) => (" " + className + " "))}
                        </h5>
                    </CRow>
                </>
            }
        </CContainer>
    );
}