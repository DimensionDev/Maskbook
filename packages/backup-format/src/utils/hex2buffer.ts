import { sum } from 'lodash-es'

/** @internal */
export function hex2buffer(hexString: string, padded?: boolean) {
    if (hexString.length % 2) {
        hexString = '0' + hexString
    }
    let res = new Uint8Array(hexString.length / 2)
    for (let i = 0; i < hexString.length; i += 2) {
        const c = hexString.slice(i, i + 2)
        res[(i - 1) / 2] = Number.parseInt(c, 16)
    }
    // BN padding
    if (padded) {
        let len = res.length
        len =
            len > 32 ?
                len > 48 ?
                    66
                :   48
            :   32
        if (res.length < len) {
            res = concat(new Uint8Array(len - res.length), res)
        }
    }
    return res
}

/** @internal */
function concat(...buf: Array<Uint8Array | number[]>) {
    const res = new Uint8Array(sum(buf.map((item) => item.length)))
    let offset = 0
    buf.forEach((item) => {
        for (let i = 0; i < item.length; i += 1) {
            res[offset + i] = item[i]
        }
        offset += item.length
    })
    return res
}
