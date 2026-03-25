import { hexToBytes, type Hex, hexToString } from 'viem'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[\dA-Fa-f]{64}$/u

export function parseStringOrBytes32(str: string | undefined, bytes32: Hex | undefined, defaultValue: string): string {
    return (
        str && str.length > 0 ? str
            // need to check for proper bytes string and valid terminator
        : bytes32 && BYTES32_REGEX.test(bytes32) && hexToBytes(bytes32)[31] === 0 ? hexToString(bytes32)
        : defaultValue
    )
}
