import { CssBaseline, MuiThemeProvider, StylesProvider } from '@material-ui/core'
import { MaskLightTheme, MaskDarkTheme, ErrorBoundary, addMaskThemeI18N } from '@dimensiondev/maskbook-theme'
import { HashRouter } from 'react-router-dom'
import { Pages } from './pages/routes'
import { StrictMode } from 'react'
import i18nNextInstance from 'i18next'
import { I18nextProvider } from 'react-i18next'

addMaskThemeI18N(i18nNextInstance)
export function App() {
    return (
        <StrictMode>
            <I18nextProvider i18n={i18nNextInstance}>
                <StylesProvider injectFirst>
                    <MuiThemeProvider theme={MaskLightTheme}>
                        <ErrorBoundary>
                            <CssBaseline />
                            <HashRouter>
                                <Pages />
                            </HashRouter>
                        </ErrorBoundary>
                    </MuiThemeProvider>
                </StylesProvider>
            </I18nextProvider>
        </StrictMode>
    )
}
