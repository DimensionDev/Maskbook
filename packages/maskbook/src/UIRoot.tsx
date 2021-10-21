import { I18nextProvider } from 'react-i18next'
import { CssBaseline, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { CustomSnackbarProvider } from '@masknet/theme'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext } from '@masknet/shared'
import i18nNextInstance from './utils/i18n-next'
import { Web3Context } from './web3/context'
import { buildInfoMarkdown } from './extension/background-script/Jobs/PrintBuildFlags'
import { Suspense } from 'react'
import { activatedSocialNetworkUI } from './social-network'
import { FACEBOOK_ID } from './social-network-adaptor/facebook.com/base'

const identity = (jsx: React.ReactNode) => jsx as JSX.Element
function compose(init: React.ReactNode, ...f: ((children: React.ReactNode) => JSX.Element)[]) {
    return f.reduceRight((prev, curr) => curr(prev), <>{init}</>)
}

type MaskThemeProvider = React.PropsWithChildren<{
    baseline: boolean
    useTheme(): Theme
}>
function MaskThemeProvider({ children, baseline, useTheme }: MaskThemeProvider) {
    const theme = useTheme()

    return compose(
        children,
        (jsx) => <ThemeProvider theme={theme} children={jsx} />,
        (jsx) => (
            <CustomSnackbarProvider
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                children={jsx}
                isFacebook={activatedSocialNetworkUI.networkIdentifier === FACEBOOK_ID}
            />
        ),
        baseline
            ? (jsx) => (
                  <>
                      <CssBaseline />
                      {jsx}
                  </>
              )
            : identity,
    )
}
export interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    kind: 'fullpage' | 'sns'
    useTheme(): Theme
}

export function MaskUIRoot({ children, kind, useTheme }: MaskUIRootProps) {
    return compose(
        children,
        (jsx) => <Suspense fallback={null} children={jsx} />,
        (jsx) => <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown} children={jsx} />,
        (jsx) => <ErrorBoundary children={jsx} />,
        (jsx) => <Web3Provider value={Web3Context} children={jsx} />,
        (jsx) => <I18nextProvider i18n={i18nNextInstance} children={jsx} />,
        kind === 'fullpage' ? (jsx) => <StyledEngineProvider injectFirst children={jsx} /> : identity,
        (jsx) => (
            <MaskThemeProvider useTheme={useTheme} baseline={kind === 'fullpage'}>
                <CssBaseline />
                {jsx}
            </MaskThemeProvider>
        ),
    )
}
