import { cloneElement, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { jsxCompose } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { createPortal } from 'react-dom'
import { i18n } from '@lingui/core'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryPersistOptions } from '../../../shared-ui/utils/persistOptions.js'
import { LinguiProviderHMR, SharedContextProvider } from '@masknet/shared'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { useMaskSiteAdaptorMixedTheme } from '../../components/useMaskSiteAdaptorMixedTheme.js'

export function ContentScriptGlobalProvider(children: React.ReactNode) {
    return jsxCompose(
        <Suspense />,
        <DialogStackingProvider hasGlobalBackdrop={false} />,
        <QueryClientProvider client={queryClient} />,
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions} />,
        <RootWeb3ContextProvider />,
        <SharedContextProvider />,
        <LinguiProviderHMR i18n={i18n} />,
        // eslint-disable-next-line react-compiler/react-compiler
        <MaskThemeProvider useMaskIconPalette={useSiteThemeMode} useTheme={useMaskSiteAdaptorMixedTheme} />,
    )(
        cloneElement,
        process.env.NODE_ENV === 'development' ?
            <>
                {/* https://github.com/TanStack/query/issues/5417 */}
                {createPortal(<ReactQueryDevtools buttonPosition="bottom-right" />, document.body)}
                {children}
            </>
        :   children,
    )
}
