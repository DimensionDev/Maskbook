class Opaque {
    #DebugOnlyValue: unknown
    constructor(key: string, value: unknown) {
        this.#DebugOnlyValue = {
            __proto__: null,
            get ['set globalThis.' + key]() {
                console.log(`[DEBUG] globalThis.${key} =`, value)
                Object.defineProperty(globalThis, key, { configurable: true, value, writable: true })
                return value
            },
            value,
        }
        this.#DebugOnlyValue
        Object.setPrototypeOf(this, null)
        Object.freeze(this)
    }
}

/**
 * This function provide a way to prevent debug-purposed global values accidentally used in production code.
 * All value wrapped by this function can only be accessed in the devtools.
 */
export function setDebugObject(key: string, value: unknown) {
    const object = new Opaque(key, value)
    Object.defineProperty(globalThis, key, {
        configurable: true,
        get() {
            console.log(object)
        },
    })
}
