import { uiSetup } from './setup'
import React from 'react'
import { HashRouter as Router, Route, Link } from 'react-router-dom'
import ReactDOM from 'react-dom'

import Welcome from './extension/options-page/Welcome'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from './utils/theme'
import { OptionsPage } from './components/OptionsPage'
import { geti18nString } from './utils/i18n'
import Privacy from './extension/options-page/Welcome/Privacy'

uiSetup()
function App() {
    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <Router>
                <Route
                    exact
                    path="/"
                    component={() => (
                        <>
                            <OptionsPage
                                buttonTitle={geti18nString('options_index_welcome')}
                                title={geti18nString('options_index_setup')}
                                to="/welcome"
                                linkComponent={Link}
                            />
                            <OptionsPage
                                buttonTitle="View our privacy policy"
                                title="How we collect and use your data"
                                to="/privacy"
                                linkComponent={Link}
                            />
                        </>
                    )}
                />
                <Route path="/welcome" component={Welcome} />
                <Route path="/privacy" component={() => Privacy} />
            </Router>
        </ThemeProvider>
    )
}

ReactDOM.render(<App />, document.getElementById('root')!)
