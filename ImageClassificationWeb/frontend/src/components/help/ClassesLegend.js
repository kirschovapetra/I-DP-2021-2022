import React from "react";
import {CTable, CImage, CRow, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow} from "@coreui/react";
import i18n from "../../translation/i18n";

/***
 * Legend for various image classes
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const ClassesLegend = () => {

    const imagesRoot = `${i18n.t("helpImgPath")}/exampleClasses`

    const tableItem = (num = -1, index = -1) => {

        if (num === -1)
            return <><CTableDataCell className={'left-border'}/><CTableDataCell/></>

        return <React.Fragment key={index}>
            <CTableDataCell className={'left-border'}>{num}</CTableDataCell>
            <CTableDataCell><CImage rounded src={`${imagesRoot}/${num}.jpg`} width={50} height={50}/></CTableDataCell>
        </React.Fragment>
    }

    const tableHeaderItem = <>
        <CTableHeaderCell scope="col" className={'left-border'}>{i18n.t("help.class")}</CTableHeaderCell>
        <CTableHeaderCell scope="col">{i18n.t("help.example")}</CTableHeaderCell>
    </>

    return (
        <>
            <h4 className={'mb-3'}>{i18n.t("help.baseNums")}</h4>

            <CTable striped small responsive align="middle">
                <CTableHead>
                    <CTableRow className={'right-border'}>
                        {tableHeaderItem}
                        {tableHeaderItem}
                        {tableHeaderItem}
                        {tableHeaderItem}
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    <CTableRow className={'right-border'}>
                        {[0, 1, 2, 3].map((num, index) => tableItem(num, index))}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {[4, 5, 6, 7].map((num, index) => tableItem(num, index))}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {[8, 9].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                        {tableItem()}
                    </CTableRow>
                </CTableBody>
            </CTable>


            <h4 className={'my-3'}>{i18n.t("help.specialSym")}</h4>

            <CTable striped small responsive align="middle">
                <CTableHead>
                    <CTableRow className={'right-border'}>
                        {tableHeaderItem}
                        {tableHeaderItem}
                        {tableHeaderItem}
                        {tableHeaderItem}
                        {tableHeaderItem}
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    <CTableRow className={'right-border'}>
                        {['0^0', '0^2', '0^I', '0^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['1^0', '1^I', '1^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['2^2', '2^I', '2^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['3^0', '3^2', '3^I', '3^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['4^0', '4^2', '4^I', '4^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['5^0', '5^2', '5^I', '5^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['6-I', '6-II', '6^2'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['7^0', '7^2', '7^I', '7^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['8^0', '8^2', '8^I', '8^II'].map((num, index) => tableItem(num, index))}
                        {tableItem()}
                    </CTableRow>
                    <CTableRow className={'right-border'}>
                        {['9-I', '9-II', '9^0', '9^2', '9^I'].map((num, index) => tableItem(num, index))}
                    </CTableRow>
                </CTableBody>
            </CTable>
        </>
    )
}