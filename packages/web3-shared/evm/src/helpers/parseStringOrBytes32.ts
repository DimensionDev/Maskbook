import * as web3_utils from /* webpackDefer: true */ 'web3-utils'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[\dA-Fa-f]{64}$/

export function parseStringOrBytes32(
    str: string | undefined,
    bytes32: string | undefined,
    defaultValue: string,
): string {
    return (
        str && str.length > 0 ? str
            // need to check for proper bytes string and valid terminator
        : bytes32 && BYTES32_REGEX.test(bytes32) && web3_utils.hexToBytes(bytes32)[31] === 0 ?
            web3_utils.toAscii(bytes32)
        :   defaultValue
    )
}
