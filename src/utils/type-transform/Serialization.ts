/// <reference path="../../env.d.ts" />
import { Serialization } from '@holoflows/kit'
import Typeson from 'typeson'
import { Ok, Err } from 'ts-results'

export function serializable<T, Q>(name: string, ser?: (x: T) => Q, des?: (x: Q) => T) {
    return <T extends NewableFunction>(constructor: T) => {
        Object.defineProperty(constructor, 'name', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name,
        })
        typeson.register({
            [name]:
                ser && des
                    ? [x => x instanceof constructor, ser, des]
                    : [
                          x => x instanceof constructor,
                          x => {
                              const y = Object.assign({}, x)
                              Object.getOwnPropertySymbols(y).forEach(x => delete y[x])
                              return typeson.encapsulate(y)
                          },
                          x => {
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
import builtins from 'typeson-registry/dist/presets/builtin'
const typeson = new Typeson({}).register([builtins])
serializable('Ok')(Ok)
serializable('Err')(Err)
export default {
    async serialization(from) {
        return typeson.encapsulate(from)
    },
    async deserialization(to: string) {
        try {
            return typeson.revive(to)
        } catch (e) {
            console.error(e)
            return {}
        }
    },
} as Serialization
