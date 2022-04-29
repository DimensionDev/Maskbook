import { GasOptionConfig, useAccount, useChainId, useWeb3 } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useCallback, useMemo, useState } from 'react'
import type { TransactionConfig } from 'web3-core'
import type { SwapOOSuccessResponse, TradeComputed } from '../../types'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapOOSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const [loading, setLoading] = useState(false)

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
            return
        }

        setLoading(true)
        // compose transaction config
        const config_ = {
            ...config,
            gas: await web3.eth
                .estimateGas(config)
                .catch((error) => {
                    throw error
                })
                .finally(() => setLoading(false)),
            ...gasConfig,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth
                .sendTransaction(config_, (error, hash) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(hash)
                    }
                })
                .finally(() => setLoading(false))
        })
    }, [web3, account, chainId, stringify(config)])

    return [loading, tradeCallback] as const
}
