import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { MaskLightTheme, MaskDarkTheme, ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { HashRouter } from 'react-router-dom'
import { Pages } from './pages/routes'
import { StrictMode } from 'react'
export function App() {
    return (
        <StrictMode>
            <ErrorBoundary>
                <MuiThemeProvider theme={MaskDarkTheme}>
                    <CssBaseline />
                    <HashRouter>
                        <Pages />
                    </HashRouter>
                </MuiThemeProvider>
            </ErrorBoundary>
        </StrictMode>
    )
}
