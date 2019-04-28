import './setup'
import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import ReactDOM from 'react-dom'

import Welcome from './extension/options-page/Welcome'
import { MuiThemeProvider } from '@material-ui/core'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'

function App() {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <Router>
                <Route exact path="/" component={() => <></>} />
                <Route path="/welcome" component={Welcome} />
            </Router>
        </MuiThemeProvider>
    )
}

ReactDOM.render(<App />, document.getElementById('root')!)
