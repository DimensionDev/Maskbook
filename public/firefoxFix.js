// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1577400
/**
 * This file is modified from webextension-shim
 * which published as AGPLv3.
 */
{
    const webAPIs = Object.getOwnPropertyDescriptors(window)
    Reflect.deleteProperty(webAPIs, 'window')
    Reflect.deleteProperty(webAPIs, 'globalThis')
    Reflect.deleteProperty(webAPIs, 'eval')
    const FixThisBindings = () => {
        const clonedWebAPIs = { ...webAPIs }
        // ? Clone Web APIs
        for (const key in webAPIs) {
            PatchThisOfDescriptorToGlobal(webAPIs[key], window)
        }
        const proto = getPrototypeChain(window)
            .map(Object.getOwnPropertyDescriptors)
            .reduceRight((previous, current) => {
                const copy = { ...current }
                for (const key in copy) {
                    PatchThisOfDescriptorToGlobal(copy[key], window)
                }
                return Object.create(previous, copy)
            }, {})
        Object.setPrototypeOf(window, proto)
        Object.defineProperties(window, clonedWebAPIs)
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
    const PatchThisOfDescriptorToGlobal = (desc, global) => {
        const { get, set, value } = desc
        if (get) desc.get = () => get.apply(global)
        if (set) desc.set = val => set.apply(global, val)
        if (value && typeof value === 'function') {
            const desc2 = Object.getOwnPropertyDescriptors(value)
            desc.value = function(...args) {
                if (new.target) return Reflect.construct(value, args, new.target)
                return Reflect.apply(value, global, args)
            }
            Object.defineProperties(desc.value, desc2)
            try {
                // ? For unknown reason this fail for some objects on Safari.
                desc.value.prototype = value.prototype
            } catch {}
        }
    }
    // In the content script, globalThis !== window.
    // @ts-ignore
    if (globalThis instanceof Window === false && typeof 'browser' === 'object') {
        FixThisBindings()
    }
    /**
     * Recursively get the prototype chain of an Object
     * @param o Object
     */
    const getPrototypeChain = (o, _ = []) => {
        if (o === undefined || o === null) return _
        const y = Object.getPrototypeOf(o)
        if (y === null || y === undefined || y === Object.prototype) return _
        return getPrototypeChain(Object.getPrototypeOf(y), [..._, y])
    }
}
