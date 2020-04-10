import elliptic from 'elliptic'
Object.assign(globalThis, { elliptic })

/**
 * Workaround of https://github.com/PeculiarVentures/webcrypto-liner/issues/76
 */
{
    const MaybeWorkerGlobalScope = Object.getPrototypeOf(Object.getPrototypeOf(globalThis))
    const crypto = Object.getOwnPropertyDescriptor(MaybeWorkerGlobalScope, 'crypto')
    // The crypto is defined in [WorkerGlobalScope], let's move it to [DedicatedWorkerGlobalScope]
    if (crypto) {
        delete MaybeWorkerGlobalScope.crypto
        Object.defineProperty(globalThis, 'crypto', crypto)
    }
}
