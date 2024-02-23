import { Typeson } from 'typeson'
import type { IsomorphicEncoder } from 'async-call-rpc'
import { Err, None, Ok, Some } from 'ts-results-es'
import { BigNumber } from 'bignumber.js'

import { blob, builtin, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import { Identifier } from '@masknet/base'

let typeson: Typeson | undefined
function setup() {
    // https://github.com/dfahlander/typeson-registry/issues/27
    typeson = new Typeson({ cyclic: false })
    typeson.register(builtin)
    typeson.register(specialNumbers)
    typeson.register([blob, file, filelist, imagebitmap])
    typeson.register({
        Ok: [(x) => x instanceof Ok, (val: Ok<any>) => val.value, (x) => Ok(x)],
        Err: [(x) => x instanceof Err, (val: Err<any>) => val.error, (x) => Err(x)],
        Some: [(x) => x instanceof Some, (val: Some<any>) => val.value, (x) => Some(x)],
        None: [(x) => x === None, () => null, () => None],
        BigNumber: [(x) => x instanceof BigNumber, (x: BigNumber) => x.toJSON(), (x) => new BigNumber(x)],
        Identifier: [
            (x) => x instanceof Identifier,
            (x: Identifier) => x.toText(),
            (x) => Identifier.from(x).expect(`${x} should be a Identifier`),
        ],
    })
}
export const simpleEncoder: IsomorphicEncoder = {
    encode(from: unknown) {
        if (!typeson) setup()
        return typeson!.encapsulate(from)
    },
    decode(to: any) {
        if (!typeson) setup()
        return typeson!.revive(to)
    },
}
