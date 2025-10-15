import { cloneElement, Suspense } from 'react'
import { CSSVariableInjector, CustomSnackbarProvider } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { Sniffings, jsxCompose } from '@masknet/shared-base'

// Providers added here will be added to ALL ShadowRoots, if you're mean to add a global one, add it in ./SiteUIProvider.tsx
export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return jsxCompose(
        <Suspense />,
        <ErrorBoundary />,
        <CustomSnackbarProvider
            disableWindowBlurListener={false}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            children={null!}
            offsetY={Sniffings.is_facebook_page ? 80 : undefined}
        />,
    )(
        cloneElement,
        <>
            <CSSVariableInjector />
            {children}
        </>,
    )
}
