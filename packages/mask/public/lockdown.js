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
;(() => {
    function freezeWebAPIs() {
        const skipHarden = ['globalThis', 'self', 'window', 'Window', '__core-js_shared__', 'Gun'].concat(
            // react-use useLocation
            'history',
            'History',
            // package abort-controller, try to assign AbortSignal onto AbortSignal
            'AbortSignal',
            // react is doing this...
            'console',
        )
        const skipUnconfigurable = ['Buffer', 'elliptic', 'regeneratorRuntime', 'assert', 'harden', 'lockdown'].concat(
            // hmm... code example for this: appear at least 2 times
            //     this.fetch = false;
            //     this.DOMException = global.DOMException;
            //     }
            //     F.prototype = global;
            //     return new F();
            'fetch',
            'DOMException',
            //   if (!self.fetch) {
            //     self.fetch = fetch;
            //     self.Headers = Headers;
            //     self.Request = Request;
            //     self.Response = Response;
            //   }
            'Headers',
            'Request',
            'Response',
        )

        const desc = Object.getOwnPropertyDescriptors(self)
        Object.entries(desc).forEach(([key, desc]) => {
            if (key.includes('Array') || key.includes('Error')) return
            if (skipUnconfigurable.includes(key)) return
            if (desc.writable) desc.writable = false
            if (desc.configurable) desc.configurable = false

            try {
                if (!skipHarden.includes(key) && desc.value) {
                    Object.freeze(desc.value)
                }
            } catch (err) {
                console.error(err)
            }
        })
        Object.defineProperties(globalThis, desc)
    }
    function freezeGlobals() {
        /**
         * @param {string} name The global name to be protected
         * @param {'accept' | 'ignore' | 'ignore-new-value'} policy The global policy
         * @param {boolean} freeze If the value should be frozen
         * @param {boolean} warn If should log a warning when accessed
         * @param {boolean} why If should trigger the debugger on set
         */
        function global(name, policy = 'accept', freeze = true, warn = false, why = false) {
            const old = Object.getOwnPropertyDescriptor(globalThis, name)
            if (old) {
                if (!old.configurable) return console.warn('globalThis.' + name + ' is not configurable.')
                if (old.get) return console.warn('TODO: harden a global getter', name)

                if (policy === 'ignore-new-value') {
                    const { value } = old
                    if (freeze) harden(value)
                    Object.defineProperty(globalThis, name, {
                        get() {
                            if (warn) console.warn(`[Deprecation] Try to access globalThis.${name}`)
                            return value
                        },
                        set() {
                            return true
                        },
                    })
                    return
                }
                Reflect.deleteProperty(globalThis, name)

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

                    if (hasBeenSet) {
                        throw new TypeError(`globalThis.${name} is not writable.`)
                    }
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
        global('regeneratorRuntime', 'ignore-new-value') // require by generator/async transpiled by babel
        // global('__EMOTION_REACT_11__', 'ignore') // by @emotion/react to avoid duplicate loading
        global('_', 'ignore') // by lodash, as UMD
    }
    try {
        // freezeWebAPIs() we cannot do that yet...
        freezeGlobals()
    } catch (error) {
        console.log('Lockdown failed', error)
    }
})()

// completion value
null
