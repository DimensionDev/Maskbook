/// <reference types="ses" />

lockdown({
    // In production, we have CSP enforced no eval
    // In development, we use Trusted Types.
    evalTaming: 'unsafeEval',
    //
    overrideTaming: 'severe',
    consoleTaming: 'unsafe',
    errorTaming: 'unsafe',
})
try {
    // Frozen extra globals
    ;(() => {
        delete globalThis.regeneratorRuntime
        /**
         * @param {string} name The global name to be protected
         * @param {'accept' | 'ignore'} policy The global policy
         * @param {boolean} freeze If the value should be frozen
         * @param {boolean} warn If should log a warning when accessed
         * @param {boolean} why If should trigger the debugger on set
         */
        function global(name, policy = 'accept', freeze = true, warn = false, why = false) {
            const old = Object.getOwnPropertyDescriptor(globalThis, name)
            if (old) {
                if (!old.configurable) return console.warn('globalThis.' + name + ' is not configurable.')
                Reflect.deleteProperty(globalThis, name)
                if (old.get) return console.warn('Cannot harden a global getter', name)

                if (policy === 'accept') {
                    const { value } = old
                    if (freeze) harden(value)
                    if (warn) {
                        Object.defineProperty(globalThis, name, {
                            get() {
                                console.warn(`[Deprecation] Try to access globalThis.${name}`)
                                return value
                            },
                        })
                    } else {
                        old.configurable = false
                        old.writable = false
                        Object.defineProperty(globalThis, name, old)
                    }
                }
                return
            }

            let value
            let hasBeenSet = false
            Object.defineProperty(globalThis, name, {
                get() {
                    if (warn) console.warn(`[Deprecation] Try to access globalThis.${name}`)
                    return value
                },
                set(val) {
                    if (why) debugger
                    if (policy === 'ignore') return

                    if (hasBeenSet) throw new TypeError(`globalThis.${name} is not writable.`)
                    hasBeenSet = true
                    value = val
                    if (freeze) harden(val)
                    return true
                },
            })
        }

        // accepted globals
        global('Buffer') // by webpack
        global('elliptic') // required by secp256k1 polyfill
        global('regeneratorRuntime') // require by generator/async transpiled by babel
        global('__EMOTION_REACT_11__', 'ignore') // by @emotion/react to avoid duplicate loading
        global('_', 'ignore') // by lodash, as UMD

        // to be investigated globals
        global('Arweave', 'accept', false) // by arweave
        global('FCL_REGISTRY', 'accept', false) // by @onflow/util-actor < @portto/sdk < @blocto/fcl
        global('Web3', 'accept', false) // by web3
        global('iFrameResize', 'accept', false) // by https://github.com/davidjbradshaw/iframe-resizer-react
        global('proto', 'accept', false) // by @blocto/protobuf < @portto/sdk < @blocto/fcl
        global('_ethers', 'accept', false) // by RSS3
    })()
} catch (error) {
    console.log('Lockdown failed', error)
}

// completion value
null
