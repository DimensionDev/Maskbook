import { FungibleTokenDetailed, ONE } from '@masknet/web3-shared-evm'
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
    const toWei = new BigNumber(toAmount || '0').shiftedBy(toToken.decimals ?? 0)
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toWei.times(ONE.minus(slippageWei))
    return minReturnWei.shiftedBy(-(toToken.decimals ?? 0)).toFixed()
}
