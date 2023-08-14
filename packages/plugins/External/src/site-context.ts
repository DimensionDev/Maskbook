const bindingContext = new Set<string>()
export type MaskSDK_Site_ContextIdentifier = string & { __brand__: 'context' }
/**
 * Generate a new random Third Party popup Context identifier.
 *
 * Most of the API calls in the Third Party popup need this identifier,
 * otherwise we don't know where should we connect the context to.
 *
 * The context will be invalidated if this page is lost.
 */
export function createThirdPartyPopupContext(): MaskSDK_Site_ContextIdentifier {
    const id = Math.random().toString(16).slice(2) as MaskSDK_Site_ContextIdentifier
    bindingContext.add(id)
    return id
}
export function isLocalContext(x: string): x is MaskSDK_Site_ContextIdentifier {
    return bindingContext.has(x)
}
