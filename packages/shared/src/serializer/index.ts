/// <reference path="./typeson.d.ts" />
import 'regenerator-runtime'
import Typeson from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Ok, Err } from 'ts-results'
import { BigNumber } from 'bignumber.js'

/** @internal */
export function serialize<T, Q>(name: string, ser?: (x: T) => Q, des?: (x: Q) => T) {
    return <T extends Function>(constructor: T) => {
        Object.defineProperty(constructor, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name,
        })
        typeson.register({
            [name]:
                ser && des
                    ? [(x: any) => x instanceof constructor, ser, des]
                    : [
                          (x: any) => x instanceof constructor,
                          (x: unknown) => {
                              const y = Object.assign({}, x)
                              Object.getOwnPropertySymbols(y).forEach((x) => Reflect.deleteProperty(y, x))
                              return typeson.encapsulate(y)
                          },
                          (x: unknown) => {
                              const y = typeson.revive(x)
                              Object.setPrototypeOf(y, constructor.prototype)
                              return y
                          },
                      ],
        })
        return constructor
    }
}

// @ts-ignore
import builtins from 'typeson-registry/dist/presets/builtin' // @ts-ignore
import num from 'typeson-registry/dist/presets/special-numbers'
import blobBased from './blob-based'
const typeson = new Typeson({})
typeson.register(blobBased)
serialize('Ok')(Ok)
serialize('Err')(Err)
serialize('BigNumber')(BigNumber)
typeson.register(num)
typeson.register(builtins)
export const serializer: Serialization = {
    serialization(from: unknown) {
        return typeson.encapsulate(from, {}, { sync: false, throwOnBadSyncType: false })
    },
    async deserialization(to: string) {
        try {
            return await typeson.revive(to, { sync: false, throwOnBadSyncType: false })
        } catch (e) {
            console.error(e)
            throw e
        }
    },
}
console.log(serializer)
