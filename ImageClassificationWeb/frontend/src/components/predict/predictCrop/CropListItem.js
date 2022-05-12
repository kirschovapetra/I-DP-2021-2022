import React, {useState} from "react";
import {CRow, CCol} from "@coreui/react";
import {Panel} from "rsuite";
import {PredictResults} from "../PredictResults";
import {PanelHeader} from "./PanelHeader";

/**
 * Single row from CropList panel
 * @param cropItemSingle - single cropped image data
 * @param id - item id
 * @param toggleExpanded - function to open/close details
 * @param updateImageFileUrl - method to update image's file URL
 * @param updateDimensions - method to update image size
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const CropListItem = ({cropItemSingle, id, toggleExpanded, updateImageFileUrl, updateDimensions}) => {

    let expanded = cropItemSingle.expanded;

    return (
        <Panel collapsible id={id} eventKey={id} expanded={expanded} bordered
               header={
                   <PanelHeader expanded={expanded} id={id}
                                toggleExpanded={toggleExpanded}
                                updateImageFileUrl={updateImageFileUrl}
                                cropItemSingle={cropItemSingle}
                                updateDimensions={updateDimensions}/>
               }
        >
            <CRow style={{overflowWrap: 'break-word', wordBreak: 'break-all'}} className={'crop-item'}>
                {
                    cropItemSingle.pred_list && (
                        <CCol className={'col-md-11 mx-auto'}>
                            <PredictResults predList={cropItemSingle.pred_list}
                                            classList={cropItemSingle.classes}
                                            loading={cropItemSingle.loading}
                                            height={150} margin={10}/>
                        </CCol>
                    )
                }
            </CRow>
        </Panel>
    )
}