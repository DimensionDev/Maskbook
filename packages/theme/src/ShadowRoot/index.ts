// createReactRoot within an empty ShadowRoot
export { createReactRootShadowedPartial } from './createReactRootShadowed'
export type {
    CreateRenderInShadowRootConfig,
    RenderInShadowRootConfig,
    ReactRootShadowed,
} from './createReactRootShadowed'
// Create a new style isolate by ShadowRoot
export { StyleIsolatePortal } from './StyleIsolatePortal'
// Inject CSS variable from this theme
export { CSSVariableInjector } from './CSSVariableInjector'
// Portal support
export {
    usePortalShadowRoot,
    setupPortalShadowRoot,
    createShadowRootForwardedComponent,
    createShadowRootForwardedPopperComponent,
} from './Portal'
export { NoEffectUsePortalShadowRootContext } from './context'
