import React from 'react'
import {NavLink, useLocation} from 'react-router-dom'
import {CLink, CNavGroup, CNavItem, CNavTitle, CSidebar, CSidebarBrand, CSidebarFooter, CSidebarNav} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {cibGithub, cilBasket, cilBolt, cilColorBorder, cilCrop, cilHouse, cilImage, cilLayers} from '@coreui/icons'
import {capitalize, ENDPOINT, ML_METHOD} from "../../utils";
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import i18n from "../../translation/i18n";
import {logo} from "../../../static/images/logo";

/***
 * Sidebar component
 * @param sidebarShow - sidebar visibility
 * @param setSidebarShow - sidebar visibility setter
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Sidebar = ({sidebarShow, setSidebarShow}) => {
    const location = useLocation()

    const getSubMenu = (method) => {
        return [
            {
                title: i18n.t("singleImage"),
                to: `${ENDPOINT.SINGLE}/${method}`,
                icon: cilImage
            },
            {
                title: i18n.t("cropImages"),
                to: `${ENDPOINT.CROP}/${method}`,
                icon: cilCrop
            },
            {
                title: i18n.t("drawImage"),
                to: `${ENDPOINT.DRAW}/${method}`,
                icon: cilColorBorder
            }
        ]
    }
    const ensembleMenu = [
        {
            title: capitalize(ML_METHOD.BAGGING),
            icon: cilBasket,
            subMenu: getSubMenu(ML_METHOD.BAGGING)
        },
        {
            title: capitalize(ML_METHOD.BOOSTING),
            icon: cilBolt,
            subMenu: getSubMenu(ML_METHOD.BOOSTING)
        },
        {
            title: capitalize(ML_METHOD.STACKING),
            icon: cilLayers,
            subMenu: getSubMenu(ML_METHOD.STACKING)
        }
    ]

    return (
        <CSidebar position="fixed" unfoldable={false} visible={sidebarShow} onVisibleChange={(visible) => setSidebarShow(visible)}>
            <CSidebarBrand className="d-none d-md-flex py-0" to="/">
                <CIcon icon={logo} customClassName={"pb-1 ps-1 pe-2 m-auto"}/>
            </CSidebarBrand>
            <CSidebarNav>
                <SimpleBar>
                    <React.Fragment>
                        <CNavItem to="/" component={NavLink}>
                            <CIcon icon={cilHouse} customClassName="nav-icon"/> {i18n.t("home")}
                        </CNavItem>
                        <CNavTitle>{i18n.t("sidebar.base")}</CNavTitle>
                        {
                            getSubMenu(ML_METHOD.CNN).map(
                                (item, key) => (
                                    <CNavItem key={key} to={item.to} component={NavLink}>
                                        <CIcon icon={item.icon} customClassName="nav-icon"/> {item.title}
                                    </CNavItem>
                                )
                            )
                        }
                        <CNavTitle>{i18n.t("sidebar.ensembles")}</CNavTitle>
                        {
                            ensembleMenu.map(
                                (item, key) => (
                                    <CNavGroup
                                        idx={String(key)}
                                        key={key}
                                        toggler={<><CIcon icon={item.icon} customClassName="nav-icon"/> {item.title}</>}
                                        visible={location.pathname.startsWith(item.to)}
                                    >
                                        {item.subMenu?.map((subItem, index) =>
                                            <CNavItem key={key} to={subItem.to} component={NavLink}>
                                                <CIcon icon={subItem.icon} customClassName="nav-icon"/> {subItem.title}
                                            </CNavItem>
                                        )}
                                    </CNavGroup>
                                )
                            )
                        }

                        <CNavTitle>{i18n.t("sidebar.twoStep")}</CNavTitle>
                        {
                            getSubMenu(ML_METHOD.TWO_STEP).map(
                                (item, key) => (
                                    <CNavItem key={key} to={item.to} component={NavLink}>
                                        <CIcon icon={item.icon} customClassName="nav-icon"/> {item.title}
                                    </CNavItem>
                                )
                            )
                        }
                    </React.Fragment>
                </SimpleBar>
            </CSidebarNav>
            <CSidebarFooter>
                <div className={'mb-0 text-center'}>
                    <CLink href="https://github.com/kirschovapetra/I-DP-2021-2022/tree/main/ImageClassificationWeb"
                           target="_blank" rel="noopener noreferrer" className="link-light">
                        <div>
                            <CIcon icon={cibGithub}/>
                        </div>
                        <div>
                            {i18n.t("sidebar.source")}
                        </div>
                    </CLink>
                </div>
            </CSidebarFooter>
        </CSidebar>
    )
}
