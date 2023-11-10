import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { BigNumber } from 'bignumber.js'

export function resolveNonFungibleTokenIdFromEnsDomain(domain: string): string {
    return new BigNumber(web3_utils.keccak256(domain.replace(/\.\w+$/, ''))).toFixed()
}
