/// <reference path="./typeson.d.ts" />
import { Typeson, TypesonPromise } from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Err, None, Ok, Some } from 'ts-results-es'
import * as BN from 'bignumber.js'
import { EncryptError, DecryptError } from '@masknet/encryption'

import { blob, builtin, cryptokey, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import { Identifier } from '@masknet/base'
import { responseRegedit } from './response.js'
import { requestRegedit } from './request.js'

const pendingRegister = new Set<() => void>()
let typeson: Typeson | undefined
function setup() {
    const { default: BigNumber } = BN
    // https://github.com/dfahlander/typeson-registry/issues/27
    typeson = new Typeson({ cyclic: false, sync: false })
    typeson.register(builtin)
    typeson.register(specialNumbers)
    typeson.register([blob, file, filelist, imagebitmap])
    typeson.register({ None: [(x) => x === None, () => 'None', () => None] })

    addClass('Ok', Ok)
    addClass('Err', Err)
    addClass('Some', Some)

    addClass('BigNumber', BigNumber)

    registerSerializableClass(
        'MaskDecryptError',
        (x) => x instanceof DecryptError,
        (e: DecryptError) => ({
            cause: (e as any).cause,
            recoverable: e.recoverable,
            message: e.message,
            stack: e.stack,
        }),
        (o) => {
            const e = new DecryptError(o.message, o.cause, o.recoverable)
            e.stack = o.stack
            return e
        },
    )
    registerSerializableClass(
        'MaskEncryptError',
        (x) => x instanceof EncryptError,
        (e: EncryptError) => ({
            cause: (e as any).cause,
            message: e.message,
            stack: e.stack,
        }),
        (o) => {
            const e = new EncryptError(o.message, o.cause)
            e.stack = o.stack
            return e
        },
    )

    typeson.register({
        Identifier: [
            (x) => x instanceof Identifier,
            (x: Identifier) => x.toText(),
            (x) => Identifier.from(x).expect(`${x} should be a Identifier`),
        ],
        Response: [...responseRegedit],
        Request: [...requestRegedit],
    })

    for (const a of pendingRegister) a()
}
export const serializer: Serialization = {
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

/** THIS MUST NOT BE USED OUTSIDE OF A DEBUGGER CONTEXT */
export function __DEBUG__ONLY__enableCryptoKeySerialization() {
    if (!typeson) setup()
    typeson!.register(cryptokey)
}
export function registerSerializableClass(name: string, constructor: NewableFunction): void
export function registerSerializableClass<T, Q>(
    name: string,
    isT: (x: unknown) => boolean,
    ser: (x: T) => Q | TypesonPromise<Q>,
    de_ser: (x: Q) => T,
): void
export function registerSerializableClass(name: string, a: any, b?: any, c?: any): void {
    if (typeson) {
        if (b) typeson.register({ [name]: [a, b, c] })
        else addClass(name, a)
    } else {
        if (b) pendingRegister.add(() => typeson!.register({ [name]: [a, b, c] }))
        else pendingRegister.add(() => addClass(name, a))
    }
}

function addClass(name: string, constructor: any) {
    Object.defineProperty(constructor, 'name', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: name,
    })
    typeson!.register({
        [name]: [
            (x) => x instanceof constructor,
            (x: unknown) => {
                return new TypesonPromise((resolve) => {
                    const cloned = Object.assign({}, x)
                    Object.getOwnPropertySymbols(cloned).forEach((x) => Reflect.deleteProperty(cloned, x))
                    Promise.resolve(typeson!.encapsulate(cloned)).then(resolve)
                })
            },
            (x: any) => {
                return new TypesonPromise((resolve) => {
                    Promise.resolve(typeson!.revive(x)).then((data) => {
                        Object.setPrototypeOf(data, constructor.prototype)
                        resolve(data)
                    })
                })
            },
        ],
    })
}
