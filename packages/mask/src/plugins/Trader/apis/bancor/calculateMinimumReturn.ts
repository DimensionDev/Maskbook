import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { leftShift, ONE, rightShift } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { BIPS_BASE } from '../../constants'

export const calculateMinimumReturn = ({
    toToken,
    toAmount,
    slippage,
}: {
    toToken: FungibleTokenDetailed
    toAmount: string | undefined
    slippage: number
}): string => {
    const toWei = leftShift(toAmount || '0', toToken.decimals)
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toWei.times(ONE.minus(slippageWei))
    return rightShift(minReturnWei, -(toToken.decimals ?? 0)).toFixed()
}
