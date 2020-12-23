import { Button, MuiThemeProvider } from '@material-ui/core'
import { MaskLightTheme } from '@dimensiondev/maskbook-theme'

export function App() {
    return (
        <MuiThemeProvider theme={MaskLightTheme}>
            <Button>123!</Button>
        </MuiThemeProvider>
    )
}
