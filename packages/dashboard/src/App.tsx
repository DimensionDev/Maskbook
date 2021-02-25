import { CssBaseline, MuiThemeProvider, StylesProvider } from '@material-ui/core'
import {
    MaskLightTheme,
    MaskDarkTheme,
    ErrorBoundary,
    addMaskThemeI18N,
    applyMaskColorVars,
} from '@dimensiondev/maskbook-theme'
import { HashRouter } from 'react-router-dom'
import { Pages } from './pages/routes'
import { StrictMode } from 'react'
import i18n from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { addDashboardI18N } from './locales'
i18n.init({
    resources: {},
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
})
i18n.use(initReactI18next)
addMaskThemeI18N(i18n)
addDashboardI18N(i18n)
applyMaskColorVars(document.body, 'light')
export function App() {
    return (
        <StrictMode>
            <I18nextProvider i18n={i18n}>
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
