import { i18n } from '@lingui/core'
import { LinguiProviderHMR, SharedContextProvider } from '@masknet/shared'
import { jsxCompose, Sniffings } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { DialogStackingProvider, MaskThemeProvider, MaskSnackbarProvider } from '@masknet/theme'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { cloneElement, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { queryPersistOptions } from '../../../shared-ui/utils/persistOptions.js'
import { useMaskSiteAdaptorMixedTheme } from '../../components/useMaskSiteAdaptorMixedTheme.js'
import { useThemeLanguage } from '../../../shared-ui/hooks/index.js'
import { useThemeSettings } from '../../components/DataSource/useActivatedUI.js'

export function ContentScriptGlobalProvider(children: React.ReactNode) {
    const theme = useMaskSiteAdaptorMixedTheme()
    const [localization] = useThemeLanguage()
    const { mode } = useThemeSettings()
    return jsxCompose(
        <Suspense />,
        <DialogStackingProvider hasGlobalBackdrop={false} />,
        <QueryClientProvider client={queryClient} />,
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions} />,
        <RootWeb3ContextProvider />,
        <SharedContextProvider />,
        <LinguiProviderHMR i18n={i18n} />,
        <MaskThemeProvider supportsDimPalette theme={theme} localization={localization} palette={mode} />,
        <MaskSnackbarProvider
            disableWindowBlurListener={false}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            offsetY={Sniffings.is_facebook_page ? 80 : undefined}
        />,
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
