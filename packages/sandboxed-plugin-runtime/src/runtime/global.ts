import { makeGlobalThis } from '@masknet/compartment'
import createMembrane from '@masknet/membrane'
import { createFetch, createTimers } from '@masknet/web-endowments'

export function createGlobal(pluginID: string, manifest: unknown, signal: AbortSignal) {
    const { proxy: localThis, revoke } = Proxy.revocable(makeGlobalThis(Object.prototype), {})
    signal.addEventListener('abort', revoke, { once: true })

    // Note: move it to elsewhere
    // Note: reenable this after https://github.com/facebook/react/pull/25198/files
    // if (typeof harden === 'function') harden(console)

    const endowments = {
        AbortController,
        AbortSignal,
        Blob,
        CustomEvent,
        DOMException,
        Crypto,
        CryptoKey,
        Event,
        EventTarget,
        File,
        FileReader,
        FormData,
        Headers,
        IdleDeadline,
        ReadableStream,
        ReadableStreamDefaultController,
        ReadableStreamDefaultReader,
        ReadableStreamBYOBReader,
        ReadableStreamBYOBRequest,
        ReadableByteStreamController,
        Request,
        Response,
        SubtleCrypto,
        TextDecoder,
        TextDecoderStream,
        TextEncoder,
        TextEncoderStream,
        // TODO: provide a custom-scheme friendly URL constructor?
        URL,
        URLSearchParams,
        WebAssembly,
        WritableStream,
        WritableStreamDefaultController,
        WritableStreamDefaultWriter,

        crypto,
        atob,
        btoa,
        ...createTimers(signal),
        fetch: createFetch({
            signal,
            canConnect(url) {
                if (new URL(url).protocol.endsWith('-extension:')) return false
                // TODO: add content security policy
                return true
            },
            // rewriteURL:
            // TODO: support rewrite URL of mask-modules
            // normalizeURL:
            // TODO: support normalize relative URL
        }),
    }

    const membrane = createMembrane(globalThis, localThis, {
        endowments: Object.getOwnPropertyDescriptors(endowments),
        // distortionCallback: (o) => (o === globalThis ? localThis : o),
    })

    // Note: the membrane library will replace all intrinsic with the link to the blueRealm
    // we need to avoid it.
    if (typeof window === 'object') Object.defineProperty(localThis, 'window', { value: localThis })
    Object.defineProperties(localThis, {
        self: { value: localThis, configurable: true, writable: true },
        globalThis: { value: localThis, configurable: true, writable: true },
        console: { value: console, configurable: true, writable: true },
    })
    membrane.virtualEnvironment.link('console')

    return { localThis, membrane }
}
