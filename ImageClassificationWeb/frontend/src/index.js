import 'react-app-polyfill/stable'
import 'core-js'
import '@coreui/coreui/dist/css/coreui.min.css';
import '../static/css/style.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from "react-router-dom";
import {App} from "./components/general/App";
import './translation/i18n';


ReactDOM.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
    document.getElementById('app'),
)
