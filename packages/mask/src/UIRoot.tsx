import { Suspense } from 'react'
import { CustomSnackbarProvider } from '@masknet/theme'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { CssBaseline, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material'
import { NetworkPluginID, PluginsWeb3ContextProvider, useAllPluginsWeb3State } from '@masknet/plugin-infra'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext, useValueRef, I18NextProviderHMR } from '@masknet/shared'
import i18nNextInstance from '../shared-ui/locales_legacy'
import { Web3Context } from './web3/context'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown'
import { activatedSocialNetworkUI } from './social-network'
import { isFacebook } from './social-network-adaptor/facebook.com/base'
import { pluginIDSettings } from './settings/settings'
import { fixWeb3State } from './plugins/EVM/UI/Web3State'
import { getBackgroundColor } from './utils'
import { MaskIconPaletteContext } from '@masknet/icons'
import { isTwitter } from './social-network-adaptor/twitter.com/base'
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

    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return compose(
        children,
        (jsx) => (
            <MaskIconPaletteContext.Provider
                value={isDark ? (!isDarker && isTwitter(activatedSocialNetworkUI) ? 'dim' : 'dark') : 'light'}>
                {jsx}
            </MaskIconPaletteContext.Provider>
        ),
        (jsx) => <ThemeProvider theme={theme} children={jsx} />,
        (jsx) => (
            <CustomSnackbarProvider
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                children={jsx}
                offsetY={isFacebook(activatedSocialNetworkUI) ? 80 : undefined}
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
    kind: 'page' | 'sns'
    useTheme(): Theme
}

export function MaskUIRoot({ children, kind, useTheme }: MaskUIRootProps) {
    const pluginID = useValueRef(pluginIDSettings)
    const PluginsWeb3State = useAllPluginsWeb3State()

    // TODO:
    // migrate EVM plugin
    fixWeb3State(PluginsWeb3State[NetworkPluginID.PLUGIN_EVM], Web3Context)

    return compose(
        children,
        (jsx) => <Suspense fallback={null} children={jsx} />,
        (jsx) => <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown} children={jsx} />,
        (jsx) => <ErrorBoundary children={jsx} />,
        (jsx) => (
            <Web3Provider value={Web3Context}>
                <PluginsWeb3ContextProvider pluginID={pluginID} value={PluginsWeb3State} children={jsx} />
            </Web3Provider>
        ),
        (jsx) => <I18NextProviderHMR i18n={i18nNextInstance} children={jsx} />,
        kind === 'page' ? (jsx) => <StyledEngineProvider injectFirst children={jsx} /> : identity,
        (jsx) => (
            <MaskThemeProvider useTheme={useTheme} baseline={kind === 'page'}>
                <CssBaseline />
                {jsx}
            </MaskThemeProvider>
        ),
    )
}
