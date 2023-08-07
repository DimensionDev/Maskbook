import { BigNumber } from 'bignumber.js'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    return new BigNumber(keccak256(toUtf8Bytes(domain.replace(/\.\w+$/, '')))).toFixed()
}
