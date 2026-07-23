import { cloneElement, Suspense } from 'react'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { jsxCompose } from '@masknet/shared-base'

// Providers added here will be added to EACH ShadowRoots, if you're mean to add a global one, add it in ./ContentScriptGlobalProvider.tsx
export function ShadowRootAttachPointRoot(children: React.ReactNode) {
    return jsxCompose(<Suspense />, <ErrorBoundary />)(cloneElement, children)
}
