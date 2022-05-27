import { FungibleToken, leftShift, ONE, rightShift } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { BIPS_BASE } from '../../constants'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export const calculateMinimumReturn = ({
    toToken,
    toAmount,
    slippage,
}: {
    toToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    toAmount: string | undefined
    slippage: number
}): string => {
    const toWei = rightShift(toAmount || '0', toToken.decimals)
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toWei.times(ONE.minus(slippageWei))
    return leftShift(minReturnWei, toToken.decimals).toFixed()
}
