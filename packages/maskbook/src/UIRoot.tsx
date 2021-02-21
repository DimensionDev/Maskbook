import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from './utils/i18n-next'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext } from '@dimensiondev/maskbook-theme'
import { buildInfoMarkdown } from './extension/background-script/Jobs/PrintBuildFlags'
export function MaskbookUIRoot(JSX: JSX.Element) {
    return (
        <I18nextProvider i18n={i18nNextInstance}>
            <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown}>
                <ErrorBoundary>
                    <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                        <StrictMode>{JSX}</StrictMode>
                    </SnackbarProvider>
                </ErrorBoundary>
            </ErrorBoundaryBuildInfoContext.Provider>
        </I18nextProvider>
    )
}
