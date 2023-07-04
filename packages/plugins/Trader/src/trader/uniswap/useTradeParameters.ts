import { useMemo } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { SwapRouter } from '@uniswap/v3-sdk'
import type { TradeProvider } from '@masknet/public-api'
import { uniswap } from '@masknet/web3-providers/helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { SLIPPAGE_DEFAULT } from '../../constants/index.js'
import type { SwapCall, Trade, TradeComputed } from '../../types/index.js'
import { useRouterV2Contract } from '../../contracts/uniswap/useRouterV2Contract.js'
import { useSwapRouterContract } from '../../contracts/uniswap/useSwapRouterContract.js'
import { useTransactionDeadline } from './useTransactionDeadline.js'
import { useGetTradeContext } from '../useGetTradeContext.js'

const UNISWAP_BIPS_BASE = 10000

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param tradeProvider
 */
export function useSwapParameters(
    trade: TradeComputed<Trade> | null, // trade to execute, required
    tradeProvider?: TradeProvider,
    allowedSlippage: number = SLIPPAGE_DEFAULT,
) {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const context = useGetTradeContext(tradeProvider)
    const deadline = useTransactionDeadline()
    const routerV2Contract = useRouterV2Contract(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        context?.ROUTER_CONTRACT_ADDRESS,
    )
    const swapRouterContract = useSwapRouterContract(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
        context?.ROUTER_CONTRACT_ADDRESS,
    )

    return useMemo<SwapCall[]>(() => {
        if (!account || !trade?.trade_ || !deadline || pluginID !== NetworkPluginID.PLUGIN_EVM) return []

        const { trade_ } = trade
        const allowedSlippage_ = new Percent(allowedSlippage, UNISWAP_BIPS_BASE)

        if (trade_ instanceof V2Trade) {
            if (!routerV2Contract) return []

            const parameters = [
                uniswap.swapCallParameters(
                    trade_,
                    {
                        feeOnTransfer: false,
                        allowedSlippage: allowedSlippage_,
                        recipient: account,
                        ttl: deadline.toNumber(),
                    },
                    tradeProvider,
                ),
            ]
            if (trade_.tradeType === TradeType.EXACT_INPUT)
                parameters.push(
                    uniswap.swapCallParameters(
                        trade_,
                        {
                            feeOnTransfer: true,
                            allowedSlippage: allowedSlippage_,
                            recipient: account,
                            ttl: deadline.toNumber(),
                        },
                        tradeProvider,
                    ),
                )
            return parameters.map(({ methodName, args, value }) => {
                return {
                    address: routerV2Contract.options.address,
                    calldata: routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](
                        // @ts-expect-error unsafe call
                        ...args,
                    ).encodeABI(),
                    value,
                }
            })
        } else {
            if (!swapRouterContract) return []
            const { value, calldata } = SwapRouter.swapCallParameters(trade_, {
                recipient: account,
                slippageTolerance: allowedSlippage_,
                deadline: deadline.toNumber(),
            })
            return [
                {
                    address: swapRouterContract.options.address,
                    calldata,
                    value,
                },
            ]
        }
    }, [account, allowedSlippage, deadline, trade, routerV2Contract, swapRouterContract, pluginID])
}
