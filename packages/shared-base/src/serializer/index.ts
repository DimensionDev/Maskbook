import { Typeson, TypesonPromise } from 'typeson'
import type { IsomorphicEncoder } from 'async-call-rpc'
import type { Encoder } from '@dimensiondev/holoflows-kit'
import { Err, None, Ok, Some } from 'ts-results-es'
import * as BN from 'bignumber.js'
import { MaskEthereumProviderRpcError } from '@masknet/sdk'

import { blob, builtin, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import { Identifier } from '@masknet/base'
import { responseSerializer } from './response.js'
import { requestSerializer } from './request.js'

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

    registerEncodableClass(
        'MaskEthereumProviderRpcError',
        (x) => x instanceof MaskEthereumProviderRpcError,
        (e: MaskEthereumProviderRpcError) => ({
            cause: e.cause,
            message: e.message,
            code: e.code,
            data: e.data,
        }),
        (o) => {
            const e = new MaskEthereumProviderRpcError(o.code, o.message, { cause: o.cause, data: o.data })
            e.stack = ''
            return e
        },
    )

    typeson.register({
        Identifier: [
            (x) => x instanceof Identifier,
            (x: Identifier) => x.toText(),
            (x) => Identifier.from(x).expect(`${x} should be a Identifier`),
        ],
        Response: [...responseSerializer],
        Request: [...requestSerializer],
    })

    for (const a of pendingRegister) a()
}
export const encoder: Encoder & IsomorphicEncoder = {
    async encode(from: unknown) {
        if (!typeson) setup()
        return typeson!.encapsulate(from)
    },
    decode(to: any) {
        if (!typeson) setup()
        return typeson!.revive(to)
    },
}
function registerEncodableClass(name: string, constructor: NewableFunction): void
function registerEncodableClass<T, Q>(
    name: string,
    isT: (x: unknown) => boolean,
    ser: (x: T) => Q | TypesonPromise<Q>,
    de_ser: (x: Q) => T,
): void
function registerEncodableClass(name: string, a: any, b?: any, c?: any): void {
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
