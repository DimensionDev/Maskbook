import { Suspense } from 'react'
import { createPortal } from 'react-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DialogStackingProvider } from '@masknet/theme'
import { compose, i18NextInstance } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { I18NextProviderHMR } from '../components/I18NextProviderHMR.js'

export function SiteUIProvider(children: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        <MaskUIRoot children={children} />,
    )
}

function MaskUIRoot({ children }: React.PropsWithChildren<{}>) {
    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <QueryClientProvider client={queryClient}>
                {process.env.NODE_ENV === 'development'
                    ? createPortal(
                          <ReactQueryDevtools position="bottom-right" toggleButtonProps={{ style: { width: 24 } }} />,
                          document.body,
                      )
                    : null}
                <RootWeb3ContextProvider>
                    <I18NextProviderHMR i18n={i18NextInstance}>{children}</I18NextProviderHMR>
                </RootWeb3ContextProvider>
            </QueryClientProvider>
        </DialogStackingProvider>
    )
}
