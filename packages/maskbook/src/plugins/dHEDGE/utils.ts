import { ChainId } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { BlockchainCode } from './types'

const ONE_THOUSAND = 1000
const ONE_MILLION = ONE_THOUSAND * 1000
const ONE_BILLION = ONE_MILLION * 1000
const ONE_TRILLION = ONE_BILLION * 1000

/**
 * A helper function to format amount
 * @param input raw amount
 * @return {String} Postfixed formatted amount
 * @example
 * formatAmountPostfix(1.234);
 * // returns 1.23
 * @example
 * formatAmountPostfix(12.34);
 * // returns 12.3
 * @example
 * formatAmountPostfix(2000.123);
 * // returns 2.12K
 * @example
 * formatAmountPostfix(20000.123);
 * // returns 20.1K
 **/
export function formatAmountPostfix(input: BigNumber.Value) {
    let postfix = ''
    let amount = new BigNumber(input)

    if (amount.isGreaterThanOrEqualTo(ONE_TRILLION)) {
        postfix = 'T'
        amount = amount.dividedBy(ONE_TRILLION)
    } else if (amount.isGreaterThanOrEqualTo(ONE_BILLION)) {
        postfix = 'B'
        amount = amount.dividedBy(ONE_BILLION)
    } else if (amount.isGreaterThanOrEqualTo(ONE_MILLION)) {
        postfix = 'M'
        amount = amount.dividedBy(ONE_MILLION)
    } else if (amount.isGreaterThanOrEqualTo(ONE_THOUSAND)) {
        postfix = 'K'
        amount = amount.dividedBy(ONE_THOUSAND)
    }

    const fixedAmount = amount.isLessThanOrEqualTo(10) ? amount.toFixed(2) : amount.toFixed(1)
    return `${fixedAmount.replace(/\.0$/, '')}${postfix}`
}

export function getChainIdFromCode(blockChainCode: BlockchainCode) {
    switch (blockChainCode) {
        case BlockchainCode.ethereum:
            return ChainId.Mainnet
        case BlockchainCode.polygon:
            return ChainId.Matic
    }
}
