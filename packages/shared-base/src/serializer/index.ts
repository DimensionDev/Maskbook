/// <reference path="./typeson.d.ts" />
import { Typeson, TypesonPromise } from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Err, None, Ok, Some } from 'ts-results'
import { BigNumber } from 'bignumber.js'

import { blob, builtin, cryptokey, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import { Identifier } from '../Identifier/index.js'
import { response, streamResponse } from './response.js'
import { request } from './request.js'

const allInstances = new Set<Typeson>()
const pendingRegister = new Set<(typeson: Typeson) => void>()
registerSerializableClass('Ok', Ok)
registerSerializableClass('Err', Err)
registerSerializableClass('Some', Some)
registerSerializableClass(
    'None',
    (x) => x === None,
    () => 'None',
    () => None,
)
registerSerializableClass('BigNumber', BigNumber)
registerSerializableClass(
    'Identifier',
    (x) => x instanceof Identifier,
    (x: Identifier) => x.toText(),
    (x) => Identifier.from(x).unwrap(),
)

export const serializer = createSerializer()

export type ContinuousSerialization<T, IR = any> = [(raw: T) => IR, (ir: IR) => T]
export interface SerializerOption {
    __debug__CryptoKey__?: boolean
    stream?: ContinuousSerialization<ReadableStream>
    abortSignal?: ContinuousSerialization<AbortSignal>
}
export function createSerializer(options: SerializerOption = {}) {
    let typeson: Typeson | undefined

    function setup() {
        if (typeson) return
        // https://github.com/dfahlander/typeson-registry/issues/27
        typeson = new Typeson({ cyclic: false, sync: false })
        typeson.register(builtin)
        typeson.register(specialNumbers)
        typeson.register([blob, file, filelist, imagebitmap])
        if (options.__debug__CryptoKey__) typeson.register(cryptokey)
        if (options.abortSignal) {
            const [send, receive] = options.abortSignal
            typeson.register({
                AbortSignal: [(val: any) => val instanceof AbortSignal, wrapAsync(send), wrapAsync(receive)],
            })
        }
        if (options.stream) {
            const [send, receive] = options.stream
            typeson.register({
                ReadableStream: [
                    (data: unknown) => data instanceof ReadableStream,
                    wrapAsync(send),
                    wrapAsync(receive),
                ],
            })
        }

        if (options.stream) {
            typeson.register({ Response: streamResponse, Request: request })
        } else {
            typeson.register({ Response: response, Request: request })
        }

        for (const a of pendingRegister) a(typeson)
    }

    const serializer: Serialization = {
        async serialization(from: unknown) {
            if (!typeson) setup()
            return typeson!.encapsulate(from)
        },
        // cspell:disable-next-line
        deserialization(to: any) {
            if (!typeson) setup()
            return typeson!.revive(to)
        },
    }
    return serializer
}
function wrapAsync(f: Function) {
    return function (...args: any[]) {
        const result = f(...args)
        if (result instanceof Promise) return new TypesonPromise((resolve, reject) => result.then(resolve, reject))
        else return result
    }
}

export function registerSerializableClass(name: string, constructor: NewableFunction): void
export function registerSerializableClass<T, Q>(
    name: string,
    isT: (x: unknown) => boolean,
    ser: (x: T) => Q | TypesonPromise<Q>,
    de_ser: (x: Q) => T,
): void
export function registerSerializableClass(name: string, a: any, b?: any, c?: any): void {
    if (b) {
        allInstances.forEach((typeson) => typeson.register({ [name]: [a, b, c] }))
        pendingRegister.add((typeson) => typeson.register({ [name]: [a, b, c] }))
    } else {
        allInstances.forEach((typeson) => addClass(typeson, name, a))
        pendingRegister.add((typeson) => addClass(typeson, name, a))
    }
}

function addClass<T>(typeson: Typeson, name: string, constructor: NewableFunction) {
    typeson.register({
        [name]: [
            (x: unknown) => x instanceof constructor,
            (val: any) => {
                const cloned = typeson.revive(val)
                if (cloned instanceof TypesonPromise) {
                    return new TypesonPromise((resolve, reject) => {
                        Promise.resolve(cloned).then((data) => {
                            Object.setPrototypeOf(data, constructor.prototype)
                            resolve(data)
                        }, reject)
                    })
                } else {
                    Object.setPrototypeOf(cloned, constructor.prototype)
                    return cloned
                }
            },
            (val: T) => {
                const cloned = Object.assign({}, val)
                Object.getOwnPropertySymbols(cloned).forEach((key) => Reflect.deleteProperty(cloned, key))
                return typeson.encapsulate(cloned)
            },
        ],
    })
}
