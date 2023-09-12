import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { type SwapResponse, type TradeComputed, TradeStrategy } from '@masknet/web3-providers/types'
import { type ChainId, ContractTransaction, useTraderConstants } from '@masknet/web3-shared-evm'
import { useExchangeProxyContract } from '../../contracts/balancer/useExchangeProxyContract.js'
import { useTradeAmount } from './useTradeAmount.js'
import { SLIPPAGE_DEFAULT } from '../../constants/index.js'

export function useTradeGasLimit(trade: TradeComputed<SwapResponse> | null): AsyncState<string> {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()
    const exchangeProxyContract = useExchangeProxyContract(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
    )
    const { BALANCER_ETH_ADDRESS } = useTraderConstants(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
    )
    const tradeAmount = useTradeAmount(trade, SLIPPAGE_DEFAULT)

    return useAsync(async () => {
        if (
            !trade?.inputToken ||
            !trade?.outputToken ||
            !exchangeProxyContract ||
            !BALANCER_ETH_ADDRESS ||
            pluginID !== NetworkPluginID.PLUGIN_EVM
        )
            return '0'

        const {
            swaps: [swaps],
        } = trade.trade_ as SwapResponse

        // cast the type to ignore the different type which was generated by typechain
        const swap_: Parameters<ExchangeProxy['methods']['multihopBatchSwapExactIn']>[0] = swaps.map((x) =>
            x.map(
                (y) =>
                    [
                        y.pool,
                        y.tokenIn,
                        y.tokenOut,
                        y.swapAmount,
                        y.limitReturnAmount,
                        y.maxPrice, // uint maxPrice
                    ] as [string, string, string, string, string, string],
            ),
        )

        const inputTokenAddress = Others.isNativeTokenSchemaType(trade.inputToken?.schema)
            ? BALANCER_ETH_ADDRESS
            : trade.inputToken.address
        const outputTokenAddress = Others.isNativeTokenSchemaType(trade.outputToken?.schema)
            ? BALANCER_ETH_ADDRESS
            : trade.outputToken.address

        // trade with the native token
        let transactionValue = '0'
        if (trade.strategy === TradeStrategy.ExactIn && Others.isNativeTokenSchemaType(trade.inputToken?.schema))
            transactionValue = trade.inputAmount.toFixed()
        else if (trade.strategy === TradeStrategy.ExactOut && Others.isNativeTokenSchemaType(trade.outputToken?.schema))
            transactionValue = trade.outputAmount.toFixed()

        const tx = await new ContractTransaction(exchangeProxyContract).fillAll(
            trade.strategy === TradeStrategy.ExactIn
                ? exchangeProxyContract.methods.multihopBatchSwapExactIn(
                      swap_,
                      inputTokenAddress,
                      outputTokenAddress,
                      trade.inputAmount.toFixed(),
                      tradeAmount.toFixed(),
                  )
                : exchangeProxyContract.methods.multihopBatchSwapExactOut(
                      swap_,
                      inputTokenAddress,
                      outputTokenAddress,
                      tradeAmount.toFixed(),
                  ),
            {
                from: account,
                value: transactionValue,
            },
        )

        return tx.gas ?? '0'
    }, [
        trade,
        exchangeProxyContract,
        BALANCER_ETH_ADDRESS,
        tradeAmount,
        account,
        pluginID,
        Others.isNativeTokenSchemaType,
    ])
}
