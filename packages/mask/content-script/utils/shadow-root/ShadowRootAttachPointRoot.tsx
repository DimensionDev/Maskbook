import { Suspense } from 'react'
import { CSSVariableInjector, CustomSnackbarProvider } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { Sniffings } from '@masknet/shared-base'

// Providers added here will be added to ALL ShadowRoots, if you're mean to add a global one, add it in ./SiteUIProvider.tsx
export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return (
        <Suspense>
            <ErrorBoundary>
                <CustomSnackbarProvider
                    disableWindowBlurListener={false}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    offsetY={Sniffings.is_facebook_page ? 80 : undefined}>
                    <CSSVariableInjector />
                    {children}
                </CustomSnackbarProvider>
            </ErrorBoundary>
        </Suspense>
    )
}
