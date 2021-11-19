import { createContext } from 'react'

/**
 * usePortalShadowRoot under this context does not do anything.
 *
 * usePortalShadowRoot will return undefined.
 */
export const NoEffectUsePortalShadowRootContext = createContext(false)
