import React, {useState} from 'react'
import {NavLink, useLocation} from 'react-router-dom'
import {CContainer, CHeader, CHeaderBrand, CHeaderNav, CHeaderToggler, CNavItem, CNavLink,} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {cifSk, cifUs, cilMenu} from '@coreui/icons'
import {ENDPOINT, ML_METHOD} from "../../utils";
import i18n from "../../translation/i18n";

const methods = [ML_METHOD.CNN, ML_METHOD.BAGGING, ML_METHOD.BOOSTING, ML_METHOD.STACKING, ML_METHOD.TWO_STEP]

/***
 * Header component
 * @param changeSidebarShow - method for changing sidebar visibility
 * @param changeLang - method for changing language
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const Header = ({changeSidebarShow, changeLang}) => {
    const routesInit = [
        ...methods.map((method) => ({path: `/single/${method}`, name: `${i18n.t("singleImage")} - ${method.toUpperCase()}`})),
        ...methods.map((method) => ({path: `/crop/${method}`, name: `${i18n.t("cropImages")} - ${method.toUpperCase()}`})),
        ...methods.map((method) => ({path: `/draw/${method}`, name: `${i18n.t("drawImage")} - ${method.toUpperCase()}`})),
        {path: ENDPOINT.ABOUT, name: i18n.t("aboutTitle")}
    ]

    const currentLocation = useLocation().pathname

    const getRouteName = (pathname, routes) => {
        const currentRoute = routes.find((route) => route.path === pathname)
        return currentRoute ? currentRoute.name : false
    }

    const getRoutes = () => {
        return routesInit
    }

    const getBreadcrumbs = (location) => {
        const breadcrumbs = []
        location.split('/').reduce((prev, curr, index, array) => {
            const currentPathname = `${prev}/${curr}`
            const routeName = getRouteName(currentPathname, getRoutes())
            if (routeName) {
                breadcrumbs.push({
                    pathname: currentPathname,
                    name: routeName,
                    active: index + 1 === array.length,
                })
            }
            return currentPathname
        })
        return breadcrumbs
    }

    const breadcrumbs = getBreadcrumbs(currentLocation)

    const [changed, setChanged] = useState()
    return (
        <CHeader position="sticky" className="mb-4">
            <CContainer fluid>
                <CHeaderToggler className="ps-1" onClick={changeSidebarShow}>
                    <CIcon icon={cilMenu} size="lg"/>
                </CHeaderToggler>
                <CHeaderBrand style={{textDecoration: 'none', cursor: 'default'}}>
                    {breadcrumbs[breadcrumbs.length - 1]?.name ? breadcrumbs[breadcrumbs.length - 1]?.name : i18n.t("home")}
                </CHeaderBrand>
                <CHeaderNav className="d-none d-md-flex me-auto"/>
                <CHeaderNav/>
                <CHeaderNav>
                    <CNavItem>
                        <CNavLink component={NavLink} to={ENDPOINT.ABOUT}>
                            {i18n.t("aboutTitle")}
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink className={`pointer ${i18n.resolvedLanguage !== 'en' && 'language-switch'}`} onClick={() => {
                            changeLang('en')
                            setChanged(Date.now())
                        }}>
                            <CIcon icon={cifUs} size="lg"/>
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink className={`pointer ${i18n.resolvedLanguage !== 'sk' && 'language-switch'}`} onClick={() => {
                            changeLang('sk')
                            setChanged(Date.now())
                        }}>
                            <CIcon icon={cifSk} size="lg"/>
                        </CNavLink>
                    </CNavItem>
                </CHeaderNav>
            </CContainer>
            {/*<CHeaderDivider/>*/}
            {/*<CContainer fluid key={changed}>*/}
            {/*    <CBreadcrumb className="m-0 ms-2">*/}
            {/*        <CBreadcrumbItem component={NavLink} to={'/'}>{i18n.t("home")}</CBreadcrumbItem>*/}
            {/*        {breadcrumbs.map(*/}
            {/*            (breadcrumb, index) => (*/}
            {/*                <CBreadcrumbItem key={index} {...(breadcrumb.active ? {active: true} : {href: breadcrumb.pathname})}>*/}
            {/*                    {breadcrumb.name}*/}
            {/*                </CBreadcrumbItem>*/}
            {/*            )*/}
            {/*        )}*/}
            {/*    </CBreadcrumb>*/}
            {/*</CContainer>*/}
        </CHeader>
    )
}