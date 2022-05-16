import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import type { TransactionConfig } from 'web3-core'
import { GasOptionConfig, TransactionState, TransactionStateType } from '@masknet/web3-shared-evm'
import type { SwapQuoteResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(chainId)) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!web3 || !account || !config || !tradeComputed) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config_ = {
            ...config,
            gas: await web3.eth
                .estimateGas({
                    from: account,
                    ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
                })
                .catch((error) => {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    return 0
                }),
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
