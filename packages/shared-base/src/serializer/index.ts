/// <reference path="./typeson.d.ts" />
import Typeson from 'typeson'
import type { Serialization } from 'async-call-rpc'
import { Ok, Err, Some, None } from 'ts-results'
import * as BN from 'bignumber.js'

// @ts-ignore
import builtins from 'typeson-registry/dist/presets/builtin' // @ts-ignore
import blob from 'typeson-registry/dist/types/blob' // @ts-ignore
import file from 'typeson-registry/dist/types/file' // @ts-ignore
import fileList from 'typeson-registry/dist/types/filelist' // @ts-ignore
import imageBitMap from 'typeson-registry/dist/types/imagebitmap' // @ts-ignore
import num from 'typeson-registry/dist/presets/special-numbers'
import { IdentifierMap } from '../Identifier/IdentifierMap'
import {
    ECKeyIdentifier,
    GroupIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '../Identifier/type'

let typeson: Typeson | undefined
const pendingRegister = new Set<() => void>()
function setup() {
    const { default: BigNumber } = BN
    typeson = new Typeson({})
    typeson.register(builtins)
    typeson.register(num)
    typeson.register([blob, file, fileList, imageBitMap, num])
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

    for (const a of pendingRegister) a()
}
export const serializer: Serialization = {
    serialization(from: unknown) {
        if (!typeson) setup()
        return typeson!.encapsulate(from)
    },
    deserialization(to: string) {
        if (!typeson) setup()
        try {
            return typeson!.revive(to)
        } catch (error) {
            console.error(error)
        }
        return {}
    },
}
export function registerSerializableClass(name: string, constructor: NewableFunction): void
export function registerSerializableClass<T, Q>(
    name: string,
    isT: (x: unknown) => boolean,
    ser: (x: T) => Q,
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
