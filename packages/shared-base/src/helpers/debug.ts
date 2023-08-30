class Opaque {
    #DebugOnlyValue: unknown
    constructor(key: string, value: unknown) {
        this.#DebugOnlyValue = {
            get ['set globalThis.' + key]() {
                console.log(`[DEBUG] globalThis.${key} =`, value)
                ;(globalThis as any)[key] = value
                return value
            },
            value,
        }
        Object.setPrototypeOf(this, null)
        Object.freeze(this)
    }
}

/**
 * This function provide a way to prevent debug-purposed global values accidentally used in production code.
 * All value wrapped by this function can only be accessed in the devtools.
 */
export function setDebugObject(key: string, value: unknown) {
    ;(globalThis as any)[key] = new Opaque(key, value)
}
