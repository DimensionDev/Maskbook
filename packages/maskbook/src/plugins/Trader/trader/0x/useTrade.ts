import { difference } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { getEnumAsArray } from '../../../../utils/enum'
import { CONSTANTS } from '../../../../web3/constants'
import { useBlockNumber } from '../../../../web3/hooks/useBlockNumber'
import { useConstant } from '../../../../web3/hooks/useConstant'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy, ZrxTradePool } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'
import { isNative } from '../../../../web3/helpers'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    const blockNumber = useBlockNumber()

    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings()
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        const sellToken = isNative(inputToken.address) ? 'ETH' : inputToken.address
        const buyToken = isNative(outputToken.address) ? 'ETH' : outputToken.address
        return PluginTraderRPC.swapQuote({
            sellToken,
            buyToken,
            sellAmount: isExactIn ? inputAmount : void 0,
            buyAmount: isExactIn ? void 0 : outputAmount,
            slippagePercentage: slippage,
            excludedSources: difference(
                getEnumAsArray(ZrxTradePool).map((x) => x.value),
                pools,
            ),
            affiliateAddress: ZRX_AFFILIATE_ADDRESS,
        })
    }, [
        NATIVE_TOKEN_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        pools.length,
        blockNumber, // refresh api each block
    ])
}
