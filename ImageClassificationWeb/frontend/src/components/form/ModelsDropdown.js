import React, {useEffect, useState} from "react";
import {capitalize, formatMessage, ML} from "../../utils";
import {DropdownGroup} from "./DropdownGroup";
import i18n from "../../translation/i18n";

/**
 * Container for handling CNN models selection
 * @param models - list of models
 * @param predictView - single/draw/crop
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ModelsDropdown = ({models, helpMethod, setModelName}) => {

    const dropdownInit = {
        id: ML.MODEL,
        name: ML.MODEL,
        text: formatMessage(helpMethod, false, i18n),
        label: capitalize(ML.MODEL),
        value: models[0] || '',
        onChange: (e) => {
            setModelsDropdown(item => item.id === e.target.id ? {...item, value: e.target.value} : item)
        },
        options: models.map(
            (mdl) => ({value: mdl})
        )
    }

    const [modelsDropdown, setModelsDropdown] = useState(dropdownInit)
    useEffect(() => setModelName(modelsDropdown.value.toLowerCase()), [modelsDropdown])

    return (
        <>
            <DropdownGroup dropdownItems={[modelsDropdown]}/>
        </>
    )
}