import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { untilDomLoaded } from '../dom'
import { Flags } from '../flags'

const attached = document.createElement('div')
/** You SHOULD NOT use this in React directly */
export const portalShadowRoot = attached.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })
const inner = document.createElement('div')
untilDomLoaded().then(() => {
    document.body.appendChild(attached)
    portalShadowRoot.appendChild(inner)
    // https://github.com/mui-org/material-ui/issues/22449
    Object.defineProperty(inner, 'parentElement', { configurable: true, writable: true, value: portalShadowRoot })
})

/**
 * @deprecated Please avoid use this directly. Use usePortalShadowRoot as it's higher-level abstraction. usePortalShadowRoot provides CSS fixes around ShadowRoot.
 */
export function PortalShadowRoot(): Element {
    if (isEnvironment(Environment.ExtensionProtocol)) return document.body
    if (globalThis.location.hostname === 'localhost') return document.body
    return inner
}
