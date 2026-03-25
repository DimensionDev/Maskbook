import { keccak256, toHex as viem_toHex } from 'viem'

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    // Note: viem's toHex is safer than our toHex in this use case.
    // our toHex will return the original string if it is already a hex string, which allows a collision attack
    // e.g. "0x616263.eth" and "abc.eth" will result to the same token ID if we use our toHex.
    return BigInt(keccak256(viem_toHex(domain.replace(/\.\w+$/u, '')))).toString()
}
