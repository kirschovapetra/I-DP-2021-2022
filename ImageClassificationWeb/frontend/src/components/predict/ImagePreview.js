import React from "react";
import {CImage} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {cilPencil} from '@coreui/icons'

/**
 * Image display
 * @param fileUrl - image file url
 * @param height - height of image
 * @param width - width of image
 * @param iconSize - size of edit icon
 * @param setModalShow - method to change modal's visibility
 * @param imageStyle - image style
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ImagePreview = ({fileUrl, height, width, iconSize, setModalShow, imageStyle}) => {

    let styles = {
        relativeContainer: {
            width: width,
            height: height,
            margin: "auto"
        }
    }
    return (
        <div className={"relativeContainer"} style={styles.relativeContainer}>
            {
                fileUrl !== ""
                    ? (
                        <>
                            <CImage id="edit_preview" src={fileUrl} className={"preview stretch"} style={imageStyle}/>
                            {
                                setModalShow !== null &&
                                <span className={`top-right-icon p-1`}>
                                    <CIcon height={iconSize} customClassName={`pointer info-icon p-1`} icon={cilPencil} onClick={() => setModalShow(true)}/>
                                </span>
                            }
                        </>
                    )
                    : <canvas id="placeholder" className={"preview stretch"}/>
            }

        </div>
    );
}
