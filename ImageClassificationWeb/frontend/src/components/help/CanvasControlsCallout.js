import React from "react";
import i18n from "../../translation/i18n";
import {CCallout} from "@coreui/react";

/***
 * Canvas controls description
 * @returns {JSX.Element}
 * @constructor
 */
export const CanvasControlsCallout = () => {

    return (
        <CCallout color="primary">
            <ul className={'text-start'}>
                <li><b>{i18n.t("constants.add")}: </b> {i18n.t("constants.addText")}</li>
                <li><b>{i18n.t("constants.select")}: </b> {i18n.t("constants.selectText")}</li>
                <li><b>{i18n.t("constants.selectMulti")}: </b> {i18n.t("constants.selectMultiText")}</li>
                <li><b>{i18n.t("constants.move")}: </b> {i18n.t("constants.moveText")}</li>
                <li><b>{i18n.t("constants.resize")}: </b> {i18n.t("constants.resizeText")}</li>
                <li><b>{i18n.t("constants.delete")}: </b> {i18n.t("constants.deleteText")}</li>
                <li><b>{i18n.t("constants.pan")}: </b> {i18n.t("constants.panText")}</li>
                <li><b>{i18n.t("help.zoom")}: </b> {i18n.t("constants.zoomText")}</li>
            </ul>
        </CCallout>
    )
}