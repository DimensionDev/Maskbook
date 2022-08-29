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
        URL,
        URLSearchParams,
        WebAssembly,
        WritableStream,
        WritableStreamDefaultController,
        WritableStreamDefaultWriter,

        // TODO: bind those timers with signal.
        cancelIdleCallback,
        requestIdleCallback,
        crypto,
        atob,
        btoa,
        clearInterval,
        clearTimeout,
        // TODO: limit what it can fetch to.
        // TODO: support fetch mask-modules: scheme and ban fetch *-extension: scheme
        // TODO: support fetch ipfs: scheme
        fetch,
        queueMicrotask,
        setInterval,
        setTimeout,
    }
    const membrane = createMembrane(globalThis, localThis, {
        endowments: Object.getOwnPropertyDescriptors(endowments),
    })
    membrane.virtualEnvironment.link('console')

    signal.addEventListener('abort', revoke, { once: true })
    return { localThis, membrane }
}
