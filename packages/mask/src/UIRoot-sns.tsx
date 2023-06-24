import { Suspense } from 'react'
import { useSNSThemeMode } from '@masknet/plugin-infra/content-script'
import { SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { compose } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from './social-network/index.js'
import { isFacebook } from './social-network-adaptor/facebook.com/base.js'
import { useMaskSiteAdaptorMixedTheme } from './utils/theme/useMaskSiteAdaptorMixedTheme.js'

export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return compose(
        (children) => <Suspense children={children} />,
        (children) => <ErrorBoundary children={children} />,
        (children) =>
            MaskThemeProvider({
                useMaskIconPalette: useSNSThemeMode,
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
