import { Suspense } from 'react'
import { StyledEngineProvider, Theme } from '@mui/material'
import { PluginsWeb3ContextProvider, useAllPluginsWeb3State } from '@masknet/plugin-infra/web3'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext, useValueRef } from '@masknet/shared-base-ui'
import { i18NextInstance } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown'
import { activatedSocialNetworkUI } from './social-network'
import { isFacebook } from './social-network-adaptor/facebook.com/base'
import { pluginIDSettings } from './settings/settings'
import { getBackgroundColor } from './utils'
import { isTwitter } from './social-network-adaptor/twitter.com/base'
import { MaskThemeProvider } from '@masknet/theme'

const identity = (jsx: React.ReactNode) => jsx as JSX.Element
function compose(init: React.ReactNode, ...f: ((children: React.ReactNode) => JSX.Element)[]) {
    // eslint-disable-next-line unicorn/no-array-reduce
    return f.reduceRight((prev, curr) => curr(prev), <>{init}</>)
}

function useMaskIconPalette(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker && isTwitter(activatedSocialNetworkUI) ? 'dim' : 'dark') : 'light'
}
export interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    kind: 'page' | 'sns'
    useTheme(): Theme
}

export function MaskUIRoot({ children, kind, useTheme }: MaskUIRootProps) {
    const pluginID = useValueRef(pluginIDSettings)
    const PluginsWeb3State = useAllPluginsWeb3State()

    return compose(
        children,
        (jsx) => <Suspense fallback={null} children={jsx} />,
        (jsx) => <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown} children={jsx} />,
        (jsx) => <ErrorBoundary children={jsx} />,
        (jsx) => <PluginsWeb3ContextProvider pluginID={pluginID} value={PluginsWeb3State} children={jsx} />,
        (jsx) => <I18NextProviderHMR i18n={i18NextInstance} children={jsx} />,
        kind === 'page' ? (jsx) => <StyledEngineProvider injectFirst children={jsx} /> : identity,
        (jsx) => (
            <MaskThemeProvider
                useMaskIconPalette={useMaskIconPalette}
                CustomSnackbarOffsetY={isFacebook(activatedSocialNetworkUI) ? 80 : undefined}
                useTheme={useTheme}
                children={jsx}
            />
        ),
        (jsx) => <SharedContextProvider>{jsx}</SharedContextProvider>,
    )
}
