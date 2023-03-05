import { BigNumber } from 'bignumber.js'
import { leftShift, ONE, rightShift } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { BIPS_BASE } from '../../constants/index.js'

export const calculateMinimumReturn = ({
    toToken,
    toAmount,
    slippage,
}: {
    toToken: Web3Helper.FungibleTokenAll
    toAmount: string | undefined
    slippage: number
}): string => {
    const toWei = rightShift(toAmount || '0', toToken.decimals)
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toWei.times(ONE.minus(slippageWei))
    return leftShift(minReturnWei, toToken.decimals).toFixed()
}
