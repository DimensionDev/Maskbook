import { Suspense } from 'react'
import type { Theme } from '@mui/material'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, BuildInfo, useValueRef } from '@masknet/shared-base-ui'
import { compose, getSiteType, i18NextInstance, NetworkPluginID } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown.js'
import { activatedSocialNetworkUI } from './social-network/index.js'
import { pluginIDSettings } from './../shared/legacy-settings/settings.js'
import { isTwitter } from './social-network-adaptor/twitter.com/base.js'
import { useMaskSiteAdaptorMixedTheme } from './utils/theme/useMaskSiteAdaptorMixedTheme.js'
import { getBackgroundColor } from './utils/theme/color-tools.js'
import { isFacebook } from './social-network-adaptor/facebook.com/base.js'

function useMaskIconPalette(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker && isTwitter(activatedSocialNetworkUI) ? 'dim' : 'dark') : 'light'
}

export function MaskUIRootSNS(children: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        (children) => <BuildInfo.Provider value={buildInfoMarkdown} children={children} />,

        <MaskUIRoot children={children} />,
    )
}

function MaskUIRoot({ children }: React.PropsWithChildren<{}>) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)

    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    return compose(
        (children) => DialogStackingProvider({ children, hasGlobalBackdrop: false }),
        (children) => Web3ContextProvider({ value: context, children }),
        (children) => I18NextProviderHMR({ i18n: i18NextInstance, children }),
        <>{children}</>,
    )
}

export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return compose(
        (children) => <Suspense children={children} />,
        (children) => <ErrorBoundary children={children} />,
        (children) =>
            MaskThemeProvider({
                useMaskIconPalette,
                useTheme: useMaskSiteAdaptorMixedTheme,
                CustomSnackbarOffsetY: isFacebook(activatedSocialNetworkUI) ? 80 : undefined,
                children,
            }),
        (children) => SharedContextProvider({ children }),
        <>
            <CSSVariableInjector />
            {children}
        </>,
    )
}
