import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from './utils/i18n-next'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext } from '@dimensiondev/maskbook-theme'
import { buildInfoMarkdown } from './extension/background-script/Jobs/PrintBuildFlags'
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@material-ui/core'
import { StylesProvider } from '@material-ui/styles'
import { useClassicMaskTheme } from './utils/theme'
import { Web3Provider } from '@dimensiondev/web3-shared'
import { Web3Context } from './web3/context'

export function MaskUIRootWithinShadow(JSX: JSX.Element) {
    return (
        <StrictMode>
            <I18nextProvider i18n={i18nNextInstance}>
                <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown}>
                    <ErrorBoundary>
                        <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                            <StrictMode>{JSX}</StrictMode>
                        </SnackbarProvider>
                    </ErrorBoundary>
                </ErrorBoundaryBuildInfoContext.Provider>
            </I18nextProvider>
        </StrictMode>
    )
}

/** Use this if the root is rendered the whole page (instead of content script case) */
export function MaskUIRoot(JSX: JSX.Element) {
    return MaskUIRootWithinShadow(
        <StyledEngineProvider injectFirst>
            <StylesProvider>
                <ThemeProvider theme={useClassicMaskTheme()}>
                    <CssBaseline />
                    <Web3Provider value={Web3Context}>{JSX}</Web3Provider>
                </ThemeProvider>
            </StylesProvider>
        </StyledEngineProvider>,
    )
}
