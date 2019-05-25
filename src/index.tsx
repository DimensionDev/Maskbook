import { uiSetup } from './setup'
import React from 'react'
import { HashRouter as Router, Route, Link } from 'react-router-dom'
import ReactDOM from 'react-dom'

import Welcome from './extension/options-page/Welcome'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from './utils/theme'
import { geti18nString } from './utils/i18n'

uiSetup()
function App() {
    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <Router>
                <Route
                    exact
                    path="/"
                    component={() => <Link to="/welcome">{geti18nString('options_index_welcome')}</Link>}
                />
                <Route path="/welcome" component={Welcome} />
            </Router>
        </ThemeProvider>
    )
}

ReactDOM.render(<App />, document.getElementById('root')!)
