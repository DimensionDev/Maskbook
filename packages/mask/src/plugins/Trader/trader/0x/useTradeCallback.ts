import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-unified'
import stringify from 'json-stable-stringify'
import type { TransactionConfig } from 'web3-core'
import { GasOptionConfig, TransactionEventType } from '@masknet/web3-shared-evm'
import type { SwapQuoteResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(chainId)) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as TransactionConfig
    }, [account, tradeComputed, gasConfig])

    return useAsyncFn(async () => {
        // validate config
        if (!web3 || !account || !config || !tradeComputed) {
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
