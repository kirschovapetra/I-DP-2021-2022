import {CCol, CContainer, CFormInput, CRow} from "@coreui/react";
import React, {useEffect, useState} from "react";
import {useFileReader} from "react-use-file-reader/dist/file-reader";
import i18n from "../../translation/i18n";

/**
 * Form for file uploaf
 * @param setFileUrl - method for updating current file URL
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const UploadForm = ({setFileUrl}) => {

    const [lastImage, setLastImage] = useState(undefined)
    const [{result, error, loading}, setFile] = useFileReader({method: 'readAsDataURL'})

    const handleFileUpload = (e) => {
        let img = e.target.files[0]

        if (img) {
            let change = true;
            if (result) change = confirm(i18n.t("upload.sure"));

            if (change) {
                setFile(img)
                setLastImage(img)
            } else {
                setFile(lastImage)
                e.target.value = null
                e.target.files = null
            }
        }
    }

    useEffect(() => {
        if (result) setFileUrl(result.toString())
    }, [result])

    return (
        <CRow className="my-3">
            <CCol className={'m-auto text-end col-lg-6'}>
                <CContainer>
                    <CFormInput id='image_file' name="image_file" type="file" placeholder="image file"
                                onChange={handleFileUpload} text={i18n.t("constants.upload")}/>
                </CContainer>
                </CCol>
        </CRow>
    );
}