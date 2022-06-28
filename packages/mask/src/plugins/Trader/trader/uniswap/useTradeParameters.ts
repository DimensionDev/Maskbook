import { useMemo } from 'react'
import JSBI from 'jsbi'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { Router, Trade as V2Trade } from '@uniswap/v2-sdk'
import { SLIPPAGE_DEFAULT } from '../../constants'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import { SwapRouter } from '@uniswap/v3-sdk'
import { useRouterV2Contract } from '../../contracts/uniswap/useRouterV2Contract'
import { useSwapRouterContract } from '../../contracts/uniswap/useSwapRouterContract'
import { useTransactionDeadline } from './useTransactionDeadline'
import { useGetTradeContext } from '../useGetTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { TradeProvider } from '@masknet/public-api'

const UNISWAP_BIPS_BASE = JSBI.BigInt(10_000)

// Pangolin and TraderJoe have modified uniswap contracts
type SwapParams = Parameters<typeof Router.swapCallParameters>
const swapCallParameters = (trade: SwapParams[0], options: SwapParams[1], tradeProvider?: TradeProvider) => {
    const parameters = Router.swapCallParameters(trade, options)
    if (tradeProvider === TradeProvider.PANGOLIN || tradeProvider === TradeProvider.TRADERJOE) {
        switch (parameters.methodName) {
            case 'WETH':
                parameters.methodName = 'WAVAX'
                break
            case 'swapTokensForExactETH':
                parameters.methodName = 'swapTokensForExactAVAX'
                break
            case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                parameters.methodName = 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
                break
            case 'swapExactTokensForETH':
                parameters.methodName = 'swapExactTokensForAVAX'
                break
            case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                parameters.methodName = 'swapExactAVAXForTokensSupportingFeeOnTransferTokens'
                break
            case 'swapExactETHForTokens':
                parameters.methodName = 'swapExactAVAXForTokens'
                break
        }
    }
    return parameters
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param tradeProvider
 */
export function useSwapParameters(
    trade: TradeComputed<Trade> | null, // trade to execute, required
    tradeProvider?: TradeProvider,
    allowedSlippage: number = SLIPPAGE_DEFAULT, // in bips
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const context = useGetTradeContext(tradeProvider)
    const { targetChainId } = TargetChainIdContext.useContainer()
    const deadline = useTransactionDeadline()
    const routerV2Contract = useRouterV2Contract(targetChainId, context?.ROUTER_CONTRACT_ADDRESS)
    const swapRouterContract = useSwapRouterContract(targetChainId, context?.ROUTER_CONTRACT_ADDRESS)

    return useMemo<SwapCall[]>(() => {
        if (!account || !trade?.trade_ || !deadline) return []

        const { trade_ } = trade
        const allowedSlippage_ = new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE)

        if (trade_ instanceof V2Trade) {
            if (!routerV2Contract) return []

            const parameters = [
                swapCallParameters(
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
                    swapCallParameters(
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
                        // @ts-ignore
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
    }, [account, allowedSlippage, deadline, trade, routerV2Contract, swapRouterContract])
}
