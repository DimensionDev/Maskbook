import { Suspense } from 'react'
import { StyledEngineProvider, Theme } from '@mui/material'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, BuildInfo, useValueRef } from '@masknet/shared-base-ui'
import { compose, getSiteType, i18NextInstance, NetworkPluginID } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown.js'
import { activatedSocialNetworkUI } from './social-network/index.js'
import { pluginIDSettings } from './../shared/legacy-settings/settings.js'
import { getBackgroundColor } from './utils/index.js'
import { isTwitter } from './social-network-adaptor/twitter.com/base.js'

export function useMaskIconPalette(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker && isTwitter(activatedSocialNetworkUI) ? 'dim' : 'dark') : 'light'
}

export function MaskUIRoot(
    kind: 'page' | 'sns',
    useTheme: () => Theme,
    children: React.ReactNode,
    fallback?: React.ReactNode,
) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        (children) => <BuildInfo.Provider value={buildInfoMarkdown} children={children} />,

        // Provide the minimal environment (i18n context) for CrashUI in page mode
        kind === 'page' && ((children) => I18NextProviderHMR({ i18n: i18NextInstance, children })),
        // StyledEngineProvider is not needed in SNS mode.
        kind === 'page' && ((children) => StyledEngineProvider({ injectFirst: true, children })),
        // We does not provide CrashUI at this level for SNS mode because we have no place to show the message, just let it crash.
        kind === 'page' && ((children) => <ErrorBoundary children={children} />),

        (children) => <Inner kind={kind} useTheme={useTheme} fallback={fallback} children={children} />,
        <>{children}</>,
    )
}

interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    kind: 'page' | 'sns'
    useTheme(): Theme
    fallback?: React.ReactNode
}
function Inner({ children, kind, useTheme, fallback }: MaskUIRootProps) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)

    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    return compose(
        (children) => DialogStackingProvider({ children, hasGlobalBackdrop: true }),
        (children) => Web3ContextProvider({ value: context, children }),
        // already provided above (in page mode)
        kind !== 'page' && ((children) => I18NextProviderHMR({ i18n: i18NextInstance, children })),
        kind === 'page' && ((children) => MaskThemeProvider({ useMaskIconPalette, useTheme, children })),
        (children) => SharedContextProvider({ children }),
        kind === 'page' && ((jsx) => <Suspense fallback={fallback ?? null} children={jsx} />),
        <>{children}</>,
    )
}
Inner.displayName = 'MaskUIRoot'
