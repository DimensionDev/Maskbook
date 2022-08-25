import { makeGlobalThis } from '@masknet/compartment'
import createMembrane from '@masknet/membrane'

export function createGlobal(pluginID: string, manifest: unknown, signal: AbortSignal) {
    const { proxy: localThis, revoke } = Proxy.revocable(makeGlobalThis(Object.prototype), {})

    // TODO: move this out
    // TODO: type of harden
    // @ts-ignore
    harden(console)

    Object.defineProperties(localThis, {
        window: { value: localThis },
        self: { value: localThis },
        console: { value: console },
    })

    const endowments = {
        // TODO: limit what it can fetch to.
        // TODO: support fetch mask-modules: scheme and ban fetch *-extension: scheme
        // TODO: support fetch ipfs: scheme
        fetch,
        Request,
        Response,
        AbortSignal,
        EventTarget,
        AbortController,
        URL,
        atob,
        btoa,
        TextEncoder,
        TextDecoder,
        crypto,
    }
    const membrane = createMembrane(globalThis, localThis, {
        endowments: Object.getOwnPropertyDescriptors(endowments),
    })
    membrane.virtualEnvironment.link('console')

    signal.addEventListener('abort', revoke, { once: true })
    return { localThis, membrane }
}
