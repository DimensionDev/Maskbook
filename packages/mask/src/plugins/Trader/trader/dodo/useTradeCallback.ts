import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-es'
import type { TransactionConfig } from 'web3-core'
import { GasOptionConfig, TransactionState, TransactionStateType, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import type { SwapRouteSuccessResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapRouteSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const account = useAccount()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3(false, chainId)

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // compose transaction config
        const config_ = {
            ...config,
            gas: await web3.eth.estimateGas(config).catch((error) => {
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            }),
            ...gasConfig,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth.sendTransaction(config_, (error, hash) => {
                if (error) {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                } else {
                    setTradeState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                }
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
