import { keccak256 } from 'web3-utils'
import { BigNumber } from 'bignumber.js'

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    return new BigNumber(keccak256(domain.replace(/\.\w+$/, ''))).toFixed()
}
