import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../../../../web3/constants'
import { useBlockNumber, useChainId } from '../../../../web3/hooks/useChainState'
import { useConstant } from '../../../../web3/hooks/useConstant'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { BALANCER_SWAP_TYPE } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const slippage = useSlippageTolerance()

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        const sellToken = inputToken.address === ETH_ADDRESS ? 'ETH' : inputToken.address
        const buyToken = outputToken.address === ETH_ADDRESS ? 'ETH' : outputToken.address
        return PluginTraderRPC.getBalancerSwaps(
            sellToken,
            buyToken,
            isExactIn ? BALANCER_SWAP_TYPE.EXACT_IN : BALANCER_SWAP_TYPE.EXACT_OUT,
            isExactIn ? inputAmount : outputAmount,
        )
    }, [
        ETH_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        blockNumber, // refresh api each block
    ])
}
