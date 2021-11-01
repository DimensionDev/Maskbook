// Fix regenerator runtime
globalThis.regeneratorRuntime = undefined

// Fix for globalThis !== window in content script in Firefox
{
    const fix = () => {
        // Do not apply fix for iOS
        if (typeof webkit === 'object' && webkit.messageHandlers) return

        // In the content script, globalThis !== window.
        if (globalThis === window || typeof browser !== 'object') return

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
        const webAPIs = Object.getOwnPropertyDescriptors(window)
        Reflect.deleteProperty(webAPIs, 'window')
        Reflect.deleteProperty(webAPIs, 'globalThis')
        Reflect.deleteProperty(webAPIs, 'eval')
        function FixThisBindings() {
            const patch = { ...webAPIs }
            // ? Clone Web APIs
            for (const key in webAPIs) {
                if (brokenAPI.includes(key)) PatchThisOfDescriptorToGlobal(webAPIs[key], window)
                else delete webAPIs[key]
            }
            console.log('Applying patch', patch)
            Object.defineProperties(window, patch)
        }
        /**
         * Many methods on `window` requires `this` points to a Window object
         * Like `alert()`. If you call alert as `const w = { alert }; w.alert()`,
         * there will be an Illegal invocation.
         *
         * To prevent `this` binding lost, we need to rebind it.
         *
         * @param desc {PropertyDescriptor}
         * @param global {Window}
         */
        function PatchThisOfDescriptorToGlobal(desc, global) {
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
                desc.value = function (...args) {
                    if (new.target) return Reflect.construct(value, args, new.target)
                    return Reflect.apply(value, this === globalThis ? global : this, args)
                }
                Object.defineProperties(desc.value, desc2)
                try {
                    // ? For unknown reason this fail for some objects on Safari.
                    desc.value.prototype = value.prototype
                } catch {}
            }
        }
        FixThisBindings()
    }
    try {
        fix()
    } catch {
        // ignore
    }
}
// As the return value of the executeScript
undefined
