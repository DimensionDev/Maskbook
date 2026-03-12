import { keccak256, type Hex } from 'viem'

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    return BigInt(keccak256(domain.replace(/\.\w+$/u, '') as Hex)).toString()
}
