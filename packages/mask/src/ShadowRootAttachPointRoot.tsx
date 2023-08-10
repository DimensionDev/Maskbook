import { Suspense } from 'react'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { compose } from '@masknet/shared-base'
import { activatedSiteAdaptorUI } from './site-adaptor-infra/index.js'
import { isFacebook } from './site-adaptors/facebook.com/base.js'
import { useMaskSiteAdaptorMixedTheme } from './utils/theme/useMaskSiteAdaptorMixedTheme.js'

export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return compose(
        (children) => <Suspense children={children} />,
        (children) => <ErrorBoundary children={children} />,
        (children) =>
            MaskThemeProvider({
                useMaskIconPalette: useSiteThemeMode,
                useTheme: useMaskSiteAdaptorMixedTheme,
                CustomSnackbarOffsetY: isFacebook(activatedSiteAdaptorUI) ? 80 : undefined,
                children,
            }),
        (children) => SharedContextProvider({ children }),
        <>
            <CSSVariableInjector />
            {children}
        </>,
    )
}
