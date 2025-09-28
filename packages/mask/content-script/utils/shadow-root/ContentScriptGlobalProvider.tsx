import { i18n } from '@lingui/core'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { LinguiProviderHMR, PrivySetup, PrivySetupProvider, SharedContextProvider } from '@masknet/shared'
import { queryClient } from '@masknet/shared-base-ui'
import { DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Suspense } from 'react'
import { createPortal } from 'react-dom'
import { queryPersistOptions } from '../../../shared-ui/utils/persistOptions.js'
import { useMaskSiteAdaptorMixedTheme } from '../../components/useMaskSiteAdaptorMixedTheme.js'

export function ContentScriptGlobalProvider(children: React.ReactNode) {
    const jsx =
        process.env.NODE_ENV === 'development' ?
            <>
                {/* https://github.com/TanStack/query/issues/5417 */}
                {createPortal(<ReactQueryDevtools buttonPosition="bottom-right" />, document.body)}
                {children}
            </>
        :   children

    // eslint-disable: react-compiler/react-compiler
    // prettier-ignore
    return (
        <Suspense>
          <DialogStackingProvider hasGlobalBackdrop={false}>
            <QueryClientProvider client={queryClient}>
              <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
                <PrivySetupProvider>
                  <RootWeb3ContextProvider>
                    <PrivySetup />
                    <SharedContextProvider>
                      <LinguiProviderHMR i18n={i18n}>
                        <MaskThemeProvider
                          // eslint-disable-next-line react-compiler/react-compiler
                          useMaskIconPalette={useSiteThemeMode}
                          // eslint-disable-next-line react-compiler/react-compiler
                          useTheme={useMaskSiteAdaptorMixedTheme}>
                          {jsx}
                        </MaskThemeProvider>
                      </LinguiProviderHMR>
                    </SharedContextProvider>
                  </RootWeb3ContextProvider>
                </PrivySetupProvider>
              </PersistQueryClientProvider>
            </QueryClientProvider>
          </DialogStackingProvider>
        </Suspense>
    )
}
