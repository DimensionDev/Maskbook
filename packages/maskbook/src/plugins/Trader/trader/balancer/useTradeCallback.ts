import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    EthereumTokenType,
    TransactionEventType,
    TransactionState,
    TransactionStateType,
    useAccount,
    useChainId,
    useGasPrice,
    useNonce,
    useTraderConstants,
} from '@masknet/web3-shared'
import { useCallback, useState } from 'react'
import { SLIPPAGE_DEFAULT } from '../../constants'
import { SwapResponse, TradeComputed, TradeStrategy } from '../../types'
import { useTradeAmount } from './useTradeAmount'

export function useTradeCallback(
    trade: TradeComputed<SwapResponse> | null,
    exchangeProxyContract: ExchangeProxy | null,
    allowedSlippage = SLIPPAGE_DEFAULT,
) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const chainId = useChainId()
    const { BALANCER_ETH_ADDRESS } = useTraderConstants()

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })
    const tradeAmount = useTradeAmount(trade, allowedSlippage)

    const tradeCallback = useCallback(async () => {
        if (!trade || !trade.inputToken || !trade.outputToken || !exchangeProxyContract || !BALANCER_ETH_ADDRESS) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const {
            swaps: [swaps],
        } = trade.trade_ as SwapResponse

        // cast the type to ignore the different type which was generated by typechain
        const swap_: Parameters<ExchangeProxy['methods']['multihopBatchSwapExactIn']>[0] = swaps.map((x) =>
            x.map(
                (y) =>
                    [
                        y.pool, // address pool
                        y.tokenIn, // address tokenIn
                        y.tokenOut, // address tokenOut
                        y.swapAmount, // uint swapAmount
                        y.limitReturnAmount, // uint limitReturnAmount
                        y.maxPrice, // uint maxPrice
                    ] as [string, string, string, string, string, string],
            ),
        )

        // balancer use a different address for the native token
        const inputTokenAddress =
            trade.inputToken.type === EthereumTokenType.Native ? BALANCER_ETH_ADDRESS : trade.inputToken.address
        const outputTokenAddress =
            trade.outputToken.type === EthereumTokenType.Native ? BALANCER_ETH_ADDRESS : trade.outputToken.address

        const tx =
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
                  )

        // trade with the native token
        let transactionValue = '0'
        if (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.type === EthereumTokenType.Native)
            transactionValue = trade.inputAmount.toFixed()
        else if (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.type === EthereumTokenType.Native)
            transactionValue = trade.outputAmount.toFixed()

        // send transaction and wait for hash
        const config = {
            from: account,
            gas: await tx
                .estimateGas({
                    from: account,
                    value: transactionValue,
                })
                .catch((error: Error) => {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            gasPrice,
            nonce,
            value: transactionValue,
        }

        // send transaction and wait for hash
        return new Promise<void>((resolve, reject) => {
            const promiEvent = tx.send(config as PayableTx)
            promiEvent
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setTradeState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setTradeState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [nonce, gasPrice, chainId, trade, tradeAmount, exchangeProxyContract, BALANCER_ETH_ADDRESS])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
