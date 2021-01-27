/// <reference path="./typeson.d.ts" />
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
                    ? [(x: unknown) => x instanceof constructor, ser, des]
                    : [
                          (x: unknown) => x instanceof constructor,
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
import structuredClone from 'typeson-registry/presets/structured-cloning' // @ts-ignore
import builtins from 'typeson-registry/dist/presets/builtin' // @ts-ignore
import num from 'typeson-registry/dist/presets/special-numbers'
const typeson = new Typeson({})
serialize('Ok')(Ok)
serialize('Err')(Err)
serialize('BigNumber')(BigNumber)
typeson.register(num)
typeson.register(builtins)
typeson.register(structuredClone)
export const serializer: Serialization = {
    serialization(from: unknown) {
        return typeson.encapsulate(from)
    },
    deserialization(to: string) {
        try {
            return typeson.revive(to)
        } catch (e) {
            console.error(e)
            return {}
        }
    },
}
