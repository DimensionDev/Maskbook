/// <reference path="./typeson.d.ts" />
import { Typeson, TypesonPromise } from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Err, None, Ok, Some } from 'ts-results'
import * as BN from 'bignumber.js'

// @ts-ignore
import { blob, builtin, cryptokey, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import { Identifier } from '../Identifier'
import { responseRegedit } from './response'
import { readableStreamRegedit } from './readableStream'

const pendingRegister = new Set<() => void>()
let typeson: Typeson | undefined
function setup() {
    const { default: BigNumber } = BN
    // https://github.com/dfahlander/typeson-registry/issues/27
    typeson = new Typeson({ cyclic: false })
    typeson.register(builtin)
    typeson.register(specialNumbers)
    typeson.register([blob, file, filelist, imagebitmap])
    typeson.register({ None: [(x) => x === None, () => 'None', () => None] })

    addClass('Ok', Ok)
    addClass('Err', Err)
    addClass('Some', Some)

    addClass('BigNumber', BigNumber)

    typeson.register({
        Identifier: [(x) => x instanceof Identifier, (x: Identifier) => x.toText(), (x) => Identifier.from(x).unwrap()],
        ReadableStream: [...readableStreamRegedit],
        Response: [...responseRegedit],
    })

    for (const a of pendingRegister) a()
}
export const serializer: Serialization = {
    serialization(from: unknown) {
        if (!typeson) setup()
        return typeson!.encapsulate(from)
    },
    // cspell:disable-next-line
    deserialization(to: string) {
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
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            (x: unknown) => {
                const y = Object.assign({}, x)
                Object.getOwnPropertySymbols(y).forEach((x) => Reflect.deleteProperty(y, x))
                return typeson!.encapsulate(y)
            },
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            (x: unknown) => {
                const y = typeson!.revive(x)
                Object.setPrototypeOf(y, constructor.prototype)
                return y
            },
        ],
    })
}
