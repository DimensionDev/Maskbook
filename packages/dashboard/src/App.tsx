import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { MaskLightTheme, MaskDarkTheme } from '@dimensiondev/maskbook-theme'
import { HashRouter } from 'react-router-dom'
import { Pages } from './pages/routes'
export function App() {
    return (
        <MuiThemeProvider theme={MaskDarkTheme}>
            <CssBaseline />
            <HashRouter>
                <Pages />
            </HashRouter>
        </MuiThemeProvider>
    )
}
