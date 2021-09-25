import { I18nextProvider } from 'react-i18next'
import { Suspense } from 'react'
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@material-ui/core'
import { Web3Provider } from '@masknet/web3-shared'
import { SnackbarProvider } from '@masknet/theme'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext, SelectTokenDialogProvider } from '@masknet/shared'
import i18nNextInstance from './utils/i18n-next'
import { useClassicMaskTheme } from './utils/theme'
import { Web3Context } from './web3/context'
import { buildInfoMarkdown } from './extension/background-script/Jobs/PrintBuildFlags'

export function MaskUIRootWithinShadow(JSX: JSX.Element) {
    return (
        <Suspense fallback={null}>
            <Web3Provider value={Web3Context}>
                <I18nextProvider i18n={i18nNextInstance}>
                    <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown}>
                        <ErrorBoundary>
                            <SelectTokenDialogProvider>
                                <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                                    {JSX}
                                </SnackbarProvider>
                            </SelectTokenDialogProvider>
                        </ErrorBoundary>
                    </ErrorBoundaryBuildInfoContext.Provider>
                </I18nextProvider>
            </Web3Provider>
        </Suspense>
    )
}

/** Use this if the root is rendered the whole page (instead of content script case) */
export function MaskUIRoot(JSX: JSX.Element) {
    return MaskUIRootWithinShadow(
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={useClassicMaskTheme()}>
                <CssBaseline />
                {JSX}
            </ThemeProvider>
        </StyledEngineProvider>,
    )
}
