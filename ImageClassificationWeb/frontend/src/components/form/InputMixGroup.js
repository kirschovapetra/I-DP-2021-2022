import React from "react";
import {InputGroup} from "./InputGroup";
import {DropdownGroup} from "./DropdownGroup";
import {RangeGroup} from "./RangeGroup";

/**
 * Group of form Inputs, Selects and Ranges
 * @param inputs - input data for Input items
 * @param selects - input data for Select items
 * @param ranges - input data for Range items
 * @param labelSize - label size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const InputMixGroup = ({inputs, selects, ranges, labelSize= 3}) => {
    return (
        <>
            {(inputs != null) && <InputGroup inputs={inputs} labelSize={labelSize}/>}
            {(selects != null) && <DropdownGroup dropdownItems={selects} labelSize={labelSize}/>}
            {(ranges != null) && <RangeGroup rangeItems={ranges} labelSize={labelSize}/>}

        </>
    )
}