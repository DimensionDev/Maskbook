import { GasOptionConfig, TransactionEventType, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import type { TransactionConfig } from 'web3-core'
import type { SwapQuoteResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const account = useAccount()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()

    const web3 = useWeb3({ chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(chainId)) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        // validate config
        if (!account || !config || !tradeComputed) {
            return
        }

        const config_ = {
            ...config,
            gas: await web3.eth
                .estimateGas({
                    from: account,
                    ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
                })
                .catch(() => 0),
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth
                .sendTransaction(config_)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, reject)
        })
    }, [web3, account, chainId, stringify(config), gasConfig])
}
