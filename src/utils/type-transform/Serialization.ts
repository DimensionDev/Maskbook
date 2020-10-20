/// <reference path="../../env.d.ts" />
import type { Serialization } from '@dimensiondev/holoflows-kit'
import Typeson from 'typeson'
import { Ok, Err } from 'ts-results'
import { BigNumber } from 'bignumber.js'

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
                    ? [(x) => x instanceof constructor, ser, des]
                    : [
                          (x) => x instanceof constructor,
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
import blob from 'typeson-registry/dist/types/blob' // @ts-ignore
import file from 'typeson-registry/dist/types/file' // @ts-ignore
import fileList from 'typeson-registry/dist/types/filelist' // @ts-ignore
import imageBitMap from 'typeson-registry/dist/types/imagebitmap' // @ts-ignore
import num from 'typeson-registry/dist/presets/special-numbers'
const typeson = new Typeson({})
typeson.register(builtins)
typeson.register(num)
typeson.register([blob, file, fileList, imageBitMap, num])
serializable('Ok')(Ok as any)
serializable('Err')(Err as any)
serializable('BigNumber')(BigNumber)
const serialization: Serialization = {
    async serialization(from: unknown) {
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
}

export default serialization
