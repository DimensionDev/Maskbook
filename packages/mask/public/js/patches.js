// this key is also used for bundled React Devtools in Mask Network
if (!globalThis[Symbol.for('mask_init_patch')]) {
    globalThis[Symbol.for('mask_init_patch')] = true
    // Fix for globalThis !== window in content script in Firefox
    patch1: try {
        /**
         * Many methods on `window` requires `this` points to a Window object
         * Like `alert()`. If you call alert as `const w = { alert }; w.alert()`,
         * there will be an Illegal invocation.
         *
         * To prevent `this` binding lost, we need to rebind it.
         *
         * @param desc {PropertyDescriptor | undefined}
         * @param global {Window}
         */
        const PatchThisOfDescriptorToGlobal = (desc, global) => {
            if (!desc) return
            const { get, set, value } = desc
            if (get)
                desc.get = function () {
                    if (this === globalThis) return get.apply(window)
                    return get.apply(this)
                }
            if (set)
                desc.set = function (val) {
                    if (this === globalThis) return set.apply(global, val)
                    return set.apply(this, val)
                }
            if (value && typeof value === 'function') {
                const desc2 = Object.getOwnPropertyDescriptors(value)
                desc.value = function () {
                    if (new.target) return Reflect.construct(value, arguments, new.target)
                    return Reflect.apply(value, this === globalThis ? global : this, arguments)
                }
                Object.defineProperties(desc.value, desc2)
                try {
                    desc.value.prototype = value.prototype
                } catch {}
            }
        }
        // MV3 service worker
        if (typeof window === 'undefined') break patch1
        // In the content script, globalThis !== window.
        if (globalThis === window || !('browser' in globalThis)) break patch1

        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1577400
        /**
         * @type {(keyof typeof window & keyof typeof globalThis)[]}
         * If any API is complaining "this does not implements Window", add it here.
         */
        const brokenAPI = [
            'requestAnimationFrame',
            'setTimeout',
            'clearTimeout',
            'matchMedia',
            'getComputedStyle',
            'getSelection',
            'requestIdleCallback',
        ]
        const patch = Object.create(null)
        for (const api of brokenAPI) {
            const desc = Object.getOwnPropertyDescriptor(window, api)
            patch[api] = desc
            PatchThisOfDescriptorToGlobal(desc, window)
        }
        console.log('[Mask] applying intrinsic patches', patch)
        Object.defineProperties(window, patch)
    } catch {}

    patch2: try {
        if (location.protocol !== 'safari-web-extension:') break patch2
        /**
         * @param {Response | PromiseLike<Response>} source
         */
        WebAssembly.compileStreaming = async function (source) {
            const response = await source
            if (response.headers.get('content-type') === 'application/wasm') {
                console.warn(`[Mask] Safari WebAssembly.compileStreaming patch is no longer needed.`)
            }
            const buffer = await response.arrayBuffer()
            return WebAssembly.compile(buffer)
        }
        /**
         *
         * @param {Response | PromiseLike<Response>} source
         * @param {WebAssembly.Imports | undefined} importObject=
         */
        WebAssembly.instantiateStreaming = async function (source, importObject) {
            const response = await source
            if (response.headers.get('content-type') === 'application/wasm') {
                console.warn(`[Mask] Safari WebAssembly.instantiateStreaming patch is no longer needed.`)
            }
            const buffer = await response.arrayBuffer()
            return WebAssembly.instantiate(buffer, importObject)
        }
    } catch {}
}

undefined
