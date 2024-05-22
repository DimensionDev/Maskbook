/* ! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABILITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

const functionPrototype = Object.getPrototypeOf(Function)
// [[Metadata]] internal slot
class id {
    constructor(id) {
        return id
    }
}
class Metadata extends id {
    constructor(item) {
        super(item)
    }
    /** @type {Record<PropertyKey, Map<unknown, unknown>>} */
    #metadata = Object.create(null)
    /** @returns {x is Metadata} */
    static is(x) {
        try {
            x.#metadata
            return true
        } catch {}
        return false
    }
    static get(x) {
        if (Metadata.is(x)) return x.#metadata
    }
    static set(x, value) {
        if (!Metadata.is(x)) new Metadata(x)
        x.#metadata = value
    }
    static delete(x) {
        Metadata.set(x, undefined)
    }
}
export function decorate(decorators, target, propertyKey, attributes) {
    if (propertyKey !== undefined) {
        if (!Array.isArray(decorators)) throw new TypeError()
        if (!IsObject(target)) throw new TypeError()
        if (!IsObject(attributes) && attributes !== undefined && attributes !== null) throw new TypeError()
        if (attributes === null) attributes = undefined
        propertyKey = ToPropertyKey(propertyKey)
        return DecorateProperty(decorators, target, propertyKey, attributes)
    } else {
        if (!Array.isArray(decorators)) throw new TypeError()
        if (typeof target !== 'function') throw new TypeError()
        return DecorateConstructor(decorators, target)
    }
}
export function metadata(metadataKey, metadataValue) {
    return function decorator(target, propertyKey) {
        if (!IsObject(target)) throw new TypeError()
        if (propertyKey !== undefined && typeof propertyKey !== 'string' && typeof propertyKey !== 'symbol')
            throw new TypeError()
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)
    }
}
export function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)
}
export function hasMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryHasMetadata(metadataKey, target, propertyKey)
}
export function hasOwnMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey)
}
export function getMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryGetMetadata(metadataKey, target, propertyKey)
}
export function getOwnMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey)
}
export function getMetadataKeys(target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryMetadataKeys(target, propertyKey)
}
export function getOwnMetadataKeys(target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    return OrdinaryOwnMetadataKeys(target, propertyKey)
}
export function deleteMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (propertyKey !== undefined) propertyKey = ToPropertyKey(propertyKey)
    const metadataMap = GetOrCreateMetadataMap(target, propertyKey, /* Create*/ false)
    if (metadataMap === undefined) return false
    if (!metadataMap.delete(metadataKey)) return false
    if (metadataMap.size > 0) return true
    const targetMetadata = Metadata.get(target)
    if (targetMetadata) {
        delete targetMetadata[propertyKey]
        if (Object.keys(targetMetadata).length > 0) return true
    }
    Metadata.delete(target)
    return true
}
function DecorateConstructor(decorators, target) {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i]
        const decorated = decorator(target)
        if (decorated !== undefined && decorated !== null) {
            if (typeof decorated !== 'function') throw new TypeError()
            target = decorated
        }
    }
    return target
}
function DecorateProperty(decorators, target, propertyKey, descriptor) {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i]
        const decorated = decorator(target, propertyKey, descriptor)
        if (decorated !== undefined && decorated !== null) {
            if (!IsObject(decorated)) throw new TypeError()
            descriptor = decorated
        }
    }
    return descriptor
}
function GetOrCreateMetadataMap(O, P, Create) {
    let targetMetadata = Metadata.get(O)
    if (targetMetadata === undefined) {
        if (!Create) return undefined
        targetMetadata = Object.create(null)
        Metadata.set(O, targetMetadata)
    }
    if (!targetMetadata) throw new TypeError()
    let metadataMap = targetMetadata[P]
    if (metadataMap === undefined) {
        if (!Create) return undefined
        metadataMap = new Map()
        targetMetadata[P] = metadataMap
    }
    return metadataMap
}
// 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
function OrdinaryHasMetadata(MetadataKey, O, P) {
    const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P)
    if (hasOwn) return true
    const parent = OrdinaryGetPrototypeOf(O)
    if (parent !== null) return OrdinaryHasMetadata(MetadataKey, parent, P)
    return false
}
// 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create*/ false)
    if (metadataMap === undefined) return false
    return metadataMap.has(MetadataKey)
}
// 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
function OrdinaryGetMetadata(MetadataKey, O, P) {
    const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P)
    if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P)
    const parent = OrdinaryGetPrototypeOf(O)
    if (parent !== null) return OrdinaryGetMetadata(MetadataKey, parent, P)
    return undefined
}
// 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create*/ false)
    if (metadataMap === undefined) return undefined
    return metadataMap.get(MetadataKey)
}
// 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create*/ true)
    if (!metadataMap) throw new TypeError()
    metadataMap.set(MetadataKey, MetadataValue)
}
// 3.1.6.1 OrdinaryMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
function OrdinaryMetadataKeys(O, P) {
    const ownKeys = OrdinaryOwnMetadataKeys(O, P)
    const parent = OrdinaryGetPrototypeOf(O)
    if (parent === null) return ownKeys
    const parentKeys = OrdinaryMetadataKeys(parent, P)
    if (parentKeys.length <= 0) return ownKeys
    if (ownKeys.length <= 0) return parentKeys
    const set = new Set()
    const keys = []
    for (let _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
        const key = ownKeys_1[_i]
        const hasKey = set.has(key)
        if (!hasKey) {
            set.add(key)
            keys.push(key)
        }
    }
    for (let _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
        const key = parentKeys_1[_a]
        const hasKey = set.has(key)
        if (!hasKey) {
            set.add(key)
            keys.push(key)
        }
    }
    return keys
}
// 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
function OrdinaryOwnMetadataKeys(O, P) {
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create*/ false)
    if (metadataMap === undefined) return []
    const keysObj = metadataMap.keys()
    return [...keysObj]
}
// 6.1.7 The Object Type
// https://tc39.github.io/ecma262/#sec-object-type
function IsObject(x) {
    return typeof x === 'object' ? x !== null : typeof x === 'function'
}
const _ = new Proxy(
    {},
    {
        get(_, p) {
            return p
        },
    },
)
function ToPropertyKey(argument) {
    return _[argument]
}
// 9.1 Ordinary Object Internal Methods and Internal Slots
// https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
// 9.1.1.1 OrdinaryGetPrototypeOf(O)
// https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
function OrdinaryGetPrototypeOf(O) {
    const proto = Object.getPrototypeOf(O)
    if (typeof O !== 'function' || O === functionPrototype) return proto
    // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
    // Try to determine the superclass constructor. Compatible implementations
    // must either set __proto__ on a subclass constructor to the superclass constructor,
    // or ensure each class has a valid `constructor` property on its prototype that
    // points back to the constructor.
    // If this is not the same as Function.[[Prototype]], then this is definitely inherited.
    // This is the case when in ES6 or when using __proto__ in a compatible browser.
    if (proto !== functionPrototype) return proto
    // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
    const prototype = O.prototype
    const prototypeProto = prototype && Object.getPrototypeOf(prototype)
    if (prototypeProto == null || prototypeProto === Object.prototype) return proto
    // If the constructor was not a function, then we cannot determine the heritage.
    const constructor = prototypeProto.constructor
    if (typeof constructor !== 'function') return proto
    // If we have some kind of self-reference, then we cannot determine the heritage.
    if (constructor === O) return proto
    // we have a pretty good guess at the heritage.
    return constructor
}
