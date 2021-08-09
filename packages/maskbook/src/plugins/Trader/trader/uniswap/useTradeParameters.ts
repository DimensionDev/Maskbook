import { useMemo } from 'react'
import JSBI from 'jsbi'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { Router, Trade as V2Trade } from '@uniswap/v2-sdk'
import { SLIPPAGE_SETTINGS_DEFAULT, DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
import { useAccount } from '@masknet/web3-shared'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import { SwapRouter } from '@uniswap/v3-sdk'
import { useRouterV2Contract } from '../../contracts/uniswap/useRouterV2Contract'
import { useRouterV3Contract } from '../../contracts/uniswap/useRouterV3Contract'

const UNISWAP_BIPS_BASE = JSBI.BigInt(10_000)

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 */
export function useSwapParameters(
    trade: TradeComputed<Trade> | null, // trade to execute, required
    allowedSlippage: number = SLIPPAGE_SETTINGS_DEFAULT, // in bips
    deadline: number = DEFAULT_TRANSACTION_DEADLINE, // in seconds from now
) {
    const account = useAccount()
    const routerV2Contract = useRouterV2Contract()
    const routerV3Contract = useRouterV3Contract()
    return useMemo<SwapCall[]>(() => {
        if (!account || !trade?.trade_) return []

        const { trade_ } = trade
        const allowedSlippage_ = new Percent(JSBI.BigInt(allowedSlippage), UNISWAP_BIPS_BASE)

        if (trade_ instanceof V2Trade) {
            if (!routerV2Contract) return []
            const parameters = [
                Router.swapCallParameters(trade_, {
                    feeOnTransfer: false,
                    allowedSlippage: allowedSlippage_,
                    recipient: account,
                    ttl: deadline,
                }),
            ]
            if (trade_.tradeType === TradeType.EXACT_INPUT)
                parameters.push(
                    Router.swapCallParameters(trade_, {
                        feeOnTransfer: true,
                        allowedSlippage: allowedSlippage_,
                        recipient: account,
                        ttl: deadline,
                    }),
                )
            return parameters.map(({ methodName, args, value }) => {
                return {
                    address: routerV2Contract.options.address,
                    // @ts-ignore
                    calldata: routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](...args).encodeABI(),
                    value,
                }
            })
        } else {
            if (!routerV3Contract) return []
            const { value, calldata } = SwapRouter.swapCallParameters(trade_, {
                recipient: account,
                slippageTolerance: allowedSlippage_,
                deadline: deadline.toString(),
              })
              return [
                {
                  address: routerV3Contract.options.address,
                  calldata,
                  value,
                },
              ]
        }

    }, [account, allowedSlippage, deadline, trade, routerV2Contract, routerV3Contract])
}
