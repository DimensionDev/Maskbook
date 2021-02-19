import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance, { i18n } from './utils/i18n-next'
import { ErrorBoundary, ErrorBoundaryContext } from '@dimensiondev/maskbook-theme'
import { buildInfoMarkdown } from './extension/background-script/Jobs/PrintBuildFlags'
export function MaskbookUIRoot(JSX: JSX.Element) {
    return (
        <ErrorBoundaryContext.Provider
            value={{
                getBuildInfo: () => buildInfoMarkdown,
            }}>
            <ErrorBoundary>
                <I18nextProvider i18n={i18nNextInstance}>
                    <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                        <StrictMode>{JSX}</StrictMode>
                    </SnackbarProvider>
                </I18nextProvider>
            </ErrorBoundary>
        </ErrorBoundaryContext.Provider>
    )
}
