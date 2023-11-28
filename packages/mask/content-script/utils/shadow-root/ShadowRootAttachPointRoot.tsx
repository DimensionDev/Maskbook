import { Suspense } from 'react'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, queryClient } from '@masknet/shared-base-ui'
import { Sniffings, compose } from '@masknet/shared-base'
import { useMaskSiteAdaptorMixedTheme } from '../../components/useMaskSiteAdaptorMixedTheme.js'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryPersistOptions } from '../../../shared-ui/index.js'

export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return compose(
        (children) => <Suspense children={children} />,
        (children) => <ErrorBoundary children={children} />,
        (children) =>
            MaskThemeProvider({
                useMaskIconPalette: useSiteThemeMode,
                useTheme: useMaskSiteAdaptorMixedTheme,
                CustomSnackbarOffsetY: Sniffings.is_facebook_page ? 80 : undefined,
                children,
            }),
        (children) => (
            <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions} children={children} />
        ),
        (children) => SharedContextProvider({ children }),
        <>
            <CSSVariableInjector />
            {children}
        </>,
    )
}
