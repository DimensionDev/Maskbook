/// <reference path="./typeson.d.ts" />
import { Typeson } from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Ok, Err, Some, None } from 'ts-results'
import * as BN from 'bignumber.js'

// @ts-ignore
import { builtin, blob, file, filelist, imagebitmap, specialNumbers, cryptokey } from 'typeson-registry'
import { IdentifierMap } from '../Identifier/IdentifierMap'
import {
    ECKeyIdentifier,
    GroupIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '../Identifier/type'

let typeson: Typeson | undefined
function setup() {
    const { default: BigNumber } = BN
    type f = (...args: any[]) => any
    type T = [name: string, ser: f | undefined, de_ser: f | undefined, ctor: f]
    const all: T[] = []
    function addClass(name: string, constructor: any) {
        all.push([name, undefined, undefined, constructor])
    }
    typeson = new Typeson({})
    typeson.register(builtin)
    typeson.register(specialNumbers)
    typeson.register([blob, file, filelist, imagebitmap])
    typeson.register({ None: [(x) => x === None, () => 'None', () => None] })

    addClass('Ok', Ok)
    addClass('Err', Err)
    addClass('Some', Some)

    addClass('BigNumber', BigNumber)

    addClass('ProfileIdentifier', ProfileIdentifier)
    addClass('ECKeyIdentifier', ECKeyIdentifier)
    addClass('GroupIdentifier', GroupIdentifier)
    addClass('PostIdentifier', PostIdentifier)
    addClass('PostIVIdentifier', PostIVIdentifier)
    addClass('IdentifierMap', IdentifierMap)

    for (const [name, ser, des, constructor] of all) {
        Object.defineProperty(constructor, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name,
        })
        typeson.register({
            [name]:
                ser && des
                    ? [(x) => x instanceof constructor, ser, des]
                    : [
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
