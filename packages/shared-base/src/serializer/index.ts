import { Typeson, TypesonPromise } from 'typeson'
import type { IsomorphicEncoder } from 'async-call-rpc'
import type { Encoder } from '@dimensiondev/holoflows-kit'
import { Err, None, Ok, Some } from 'ts-results-es'
import * as BN from 'bignumber.js'

import { blob, builtin, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
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
