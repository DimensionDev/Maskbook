import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance, { i18n } from './utils/i18n-next'
import { ErrorBoundary, ErrorBoundaryContext, ErrorBoundaryContextDefault } from '@dimensiondev/maskbook-theme'
import { useI18N } from './utils/i18n-next-ui'
export function MaskbookUIRoot(JSX: JSX.Element) {
    return (
        <ErrorBoundaryContext.Provider
            value={{
                getTitle: ErrorBoundaryContextDefault.getTitle,
                getMailtoTarget() {
                    return i18n.t('dashboard_email_address')
                },
                useErrorBoundaryI18n() {
                    const { t } = useI18N()
                    return {
                        crash_title_of: (subject) => t('crash_title_of', { who: subject }),
                        report_by_email: () => 'Report by Email',
                        report_on_github: () => 'Report on GitHub',
                        try_to_recover: () => t('crash_retry'),
                    }
                },
                getBody({ message, stack }) {
                    return `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was ________, then Mask report an error.

> ${message}

Error stack:
<pre>${stack}</pre>

## Build information:

- Version: ${globalThis.browser?.runtime?.getManifest?.()?.version ?? process.env.TAG_NAME?.slice(1)}
- NODE_ENV: ${process.env.NODE_ENV}
- STORYBOOK: ${process.env.STORYBOOK}
- target: ${process.env.target}
- build: ${process.env.build}
- architecture: ${process.env.architecture}
- firefoxVariant: ${process.env.firefoxVariant}
- resolution: ${process.env.resolution}
- BUILD_DATE: ${process.env.BUILD_DATE}
- VERSION: ${process.env.VERSION}

## Git (${process.env.TAG_DIRTY ? '*' : ''}):

${process.env.COMMIT_HASH} (${process.env.BRANCH_NAME}) on tag "${process.env.TAG_NAME}"
${process.env.REMOTE_URL?.toLowerCase()?.includes('DimensionDev') ? '' : process.env.REMOTE_URL}`
                },
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
