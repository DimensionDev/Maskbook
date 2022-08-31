import { makeGlobalThis } from '@masknet/compartment'
import createMembrane from '@masknet/membrane'
import { createFetch, createTimers } from '@masknet/web-endowments'

export function createGlobal(pluginID: string, manifest: unknown, signal: AbortSignal) {
    const { proxy: localThis, revoke } = Proxy.revocable(makeGlobalThis(Object.prototype), {})
    signal.addEventListener('abort', revoke, { once: true })

    if (typeof window === 'object') Object.defineProperty(localThis, 'window', { value: localThis })
    Object.defineProperties(localThis, {
        self: { value: localThis },
        console: { value: console, configurable: true, writable: true },
    })

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
    })

    return { localThis, membrane }
}
