import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DialogStackingProvider } from '@masknet/theme'
import { compose, i18NextInstance } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { I18NextProviderHMR } from '../components/I18NextProviderHMR.js'
import { createPortal } from 'react-dom'
import { LinguiProviderHMR } from '../components/LinguiI18NProviderHMR.js'
import { i18n } from '@lingui/core'

export function SiteUIProvider(children: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        <MaskUIRoot children={children} />,
    )
}

function MaskUIRoot({ children }: React.PropsWithChildren) {
    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <QueryClientProvider client={queryClient}>
                {/* https://github.com/TanStack/query/issues/5417 */}
                {process.env.NODE_ENV === 'development' ?
                    createPortal(<ReactQueryDevtools buttonPosition="bottom-right" />, document.body)
                :   null}
                <RootWeb3ContextProvider>
                    <LinguiProviderHMR i18n={i18n}>
                        <I18NextProviderHMR i18n={i18NextInstance}>{children}</I18NextProviderHMR>
                    </LinguiProviderHMR>
                </RootWeb3ContextProvider>
            </QueryClientProvider>
        </DialogStackingProvider>
    )
}
