import * as web3_utils from /* webpackDefer: true */ 'web3-utils'

export function splitSignature(signature: string) {
    if (signature.length !== 132 && !signature.startsWith('0x')) {
        throw new Error('Invalid signature length')
    }

    // Extracting r, s, v from the signature
    const r = signature.slice(0, 66)
    const s = '0x' + signature.slice(66, 130)
    const v = web3_utils.toDecimal('0x' + signature.slice(130, 132))

    return { r, s, v }
}
