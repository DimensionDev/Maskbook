import { useContext, useMemo } from 'react'
import JSBI from 'jsbi'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { Router, Trade as V2Trade } from '@uniswap/v2-sdk'
import { SLIPPAGE_DEFAULT } from '../../constants'
import { useAccount } from '@masknet/web3-shared'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import { SwapRouter } from '@uniswap/v3-sdk'
import { useRouterV2Contract } from '../../contracts/uniswap/useRouterV2Contract'
import { useSwapRouterContract } from '../../contracts/uniswap/useSwapRouterContract'
import { TradeContext } from '../useTradeContext'
import { useTransactionDeadline } from './useTransactionDeadline'

const UNISWAP_BIPS_BASE = JSBI.BigInt(10_000)

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 */
export function useSwapParameters(
    trade: TradeComputed<Trade> | null, // trade to execute, required
    allowedSlippage: number = SLIPPAGE_DEFAULT, // in bips
) {
    const account = useAccount()
    const context = useContext(TradeContext)
    const deadline = useTransactionDeadline()
    const routerV2Contract = useRouterV2Contract(context?.ROUTER_CONTRACT_ADDRESS)
    const swapRouterContract = useSwapRouterContract(context?.ROUTER_CONTRACT_ADDRESS)

    return useMemo<SwapCall[]>(() => {
        if (!account || !trade?.trade_ || !deadline) return []

        const { trade_ } = trade
        const allowedSlippage_ = new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE)

        if (trade_ instanceof V2Trade) {
            if (!routerV2Contract) return []
            const parameters = [
                Router.swapCallParameters(trade_, {
                    feeOnTransfer: false,
                    allowedSlippage: allowedSlippage_,
                    recipient: account,
                    ttl: deadline.toNumber(),
                }),
            ]
            if (trade_.tradeType === TradeType.EXACT_INPUT)
                parameters.push(
                    Router.swapCallParameters(trade_, {
                        feeOnTransfer: true,
                        allowedSlippage: allowedSlippage_,
                        recipient: account,
                        ttl: deadline.toNumber(),
                    }),
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
