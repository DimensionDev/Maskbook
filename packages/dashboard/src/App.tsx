import { CssBaseline, MuiThemeProvider, StylesProvider } from '@material-ui/core'
import { MaskLightTheme, MaskDarkTheme, ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { HashRouter } from 'react-router-dom'
import { Pages } from './pages/routes'
import { StrictMode } from 'react'
export function App() {
    return (
        <StrictMode>
            <StylesProvider injectFirst>
                <ErrorBoundary>
                    <MuiThemeProvider theme={MaskLightTheme}>
                        <CssBaseline />
                        <HashRouter>
                            <Pages />
                        </HashRouter>
                    </MuiThemeProvider>
                </ErrorBoundary>
            </StylesProvider>
        </StrictMode>
    )
}
