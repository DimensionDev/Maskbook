/* cspell:disable */
import * as RegeneratorRuntime from 'regenerator-runtime'
import * as tslib from 'tslib'
import * as ReflectMetadata from './reflect-metadata.js'

function define(items) {
    const desc = {}
    for (const [key, value] of Object.entries(items)) {
        // ignore any value set. not using { value } because we don't want to fail when the library bring their own polyfills.
        desc[key] = { get: () => value, set: () => undefined }
    }
    Object.defineProperties(globalThis, desc)
}
function cloneAndFreeze(obj) {
    for (const item of Object.values(obj)) Object.freeze(item)
    return Object.freeze({ ...obj })
}
const ReflectClone = Object.create(Object.prototype, Object.getOwnPropertyDescriptors(Reflect))
Object.assign(ReflectClone, cloneAndFreeze(ReflectMetadata))
Object.freeze(ReflectClone)

define({
    // regenerator-runtime
    regeneratorRuntime: cloneAndFreeze(RegeneratorRuntime),

    // tslib
    ...cloneAndFreeze({
        ...tslib,
        __metadata(key, value) {
            return ReflectMetadata.metadata(key, value)
        },
        __decorate(decorators, target, key, desc) {
            return ReflectMetadata.decorate(decorators, target, key, desc)
        },
    }),

    // reflect-metadata
    ReflectMetadata: ReflectClone,
})
