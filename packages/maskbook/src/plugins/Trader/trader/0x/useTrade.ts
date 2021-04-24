import { difference } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { getEnumAsArray } from '../../../../utils/enum'
import { CONSTANTS } from '../../../../web3/constants'
import { useChainId } from '../../../../web3/hooks/useChainId'
import { useBlockNumber } from '../../../../web3/hooks/useBlockNumber'
import { useConstant } from '../../../../web3/hooks/useConstant'
import type { NativeTokenDetailed, ERC20TokenDetailed } from '../../../../web3/types'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy, ZrxTradePool } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: NativeTokenDetailed | ERC20TokenDetailed,
    outputToken?: NativeTokenDetailed | ERC20TokenDetailed,
) {
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)

    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings()
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        const sellToken = inputToken.address === NATIVE_TOKEN_ADDRESS ? 'ETH' : inputToken.address
        const buyToken = outputToken.address === NATIVE_TOKEN_ADDRESS ? 'ETH' : outputToken.address
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
