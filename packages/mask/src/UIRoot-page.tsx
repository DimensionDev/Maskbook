import { Suspense } from 'react'
import { StyledEngineProvider, Theme } from '@mui/material'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, DialogStackingProvider, GlobalBackdrop, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, BuildInfo, useValueRef } from '@masknet/shared-base-ui'
import { compose, getSiteType, i18NextInstance, NetworkPluginID } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown.js'
import { pluginIDSettings } from './../shared/legacy-settings/settings.js'

export function MaskUIRootPage(useTheme: () => Theme, children: React.ReactNode, fallback?: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        (children) => <BuildInfo.Provider value={buildInfoMarkdown} children={children} />,

        // Provide the minimal environment (i18n context) for CrashUI in page mode
        (children) => I18NextProviderHMR({ i18n: i18NextInstance, children }),
        (children) => StyledEngineProvider({ injectFirst: true, children }),
        (children) => <ErrorBoundary children={children} />,

        (children) => <MaskUIRoot useTheme={useTheme} fallback={fallback} children={children} />,
        <>{children}</>,
    )
}

interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    useTheme(): Theme
    fallback?: React.ReactNode
}
function MaskUIRoot({ children, useTheme, fallback }: MaskUIRootProps) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)

    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    return compose(
        (children) => DialogStackingProvider({ children, hasGlobalBackdrop: true }),
        (children) => MaskThemeProvider({ useMaskIconPalette: (theme) => theme.palette.mode, useTheme, children }),
        (children) => Web3ContextProvider({ value: context, children }),
        (children) => SharedContextProvider({ children }),
        <Suspense fallback={fallback}>
            <CSSVariableInjector />
            <GlobalBackdrop />
            {children}
        </Suspense>,
    )
}
