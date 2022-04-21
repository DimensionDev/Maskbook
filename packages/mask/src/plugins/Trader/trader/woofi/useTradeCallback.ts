import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import {
    GasOptionConfig,
    isNativeTokenAddress,
    TransactionEventType,
    TransactionState,
    TransactionStateType,
    useAccount,
    useWeb3,
} from '@masknet/web3-shared-evm'
import type { TradeComputed, WoofiSwapData } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import type { TradeProvider } from '@masknet/public-api'
import { useWooRouterV2Contract } from '../../contracts/woofi/useWooRouterV2Contract'
import { WOOFI_NATIVE_TOKEN_ADDRESS } from '../../constants'
import { useGetTradeContext } from '../useGetTradeContext'
import type { TransactionReceipt } from 'web3-core'

export function useTradeCallback(
    trade: TradeComputed<WoofiSwapData> | null,
    tradeProvider?: TradeProvider,
    gasConfig?: GasOptionConfig,
) {
    const account = useAccount()
    const context = useGetTradeContext(tradeProvider)
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3({ chainId })

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const swapRouterContract = useWooRouterV2Contract(context?.ROUTER_CONTRACT_ADDRESS, chainId)

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !trade?.trade_) return null
        return {
            from: account,
            ...pick(trade.trade_, ['to', 'data', 'value']),
        }
    }, [account, trade])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config || !trade?.inputToken || !trade?.outputToken) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { inputToken, outputToken } = trade

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })
        const sellToken = isNativeTokenAddress(inputToken) ? WOOFI_NATIVE_TOKEN_ADDRESS : inputToken.address
        const buyToken = isNativeTokenAddress(outputToken) ? WOOFI_NATIVE_TOKEN_ADDRESS : outputToken.address

        const swap = swapRouterContract?.methods.swap(
            sellToken,
            buyToken,
            trade.inputAmount.toString(),
            trade.minimumReceived.toString(),
            account,
            account,
        )

        // compose transaction config
        const config_ = {
            ...config,
            gas: undefined as number | undefined,
            ...gasConfig,
        }

        config_.gas = await swap?.estimateGas(config_).catch((error) => {
            setTradeState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            swap?.send(config_)
                .on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                    setTradeState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setTradeState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    setTradeState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [web3, account, chainId, stringify(config), gasConfig])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
