import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import type { TransactionConfig } from 'web3-core'
import type { SwapRouteSuccessResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapRouteSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        // validate config
        if (!account || !config || !web3) {
            return
        }

        // compose transaction config
        const config_ = {
            ...config,
            gas: await web3.eth.estimateGas(config).catch((error) => {
                throw error
            }),
            ...gasConfig,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth.sendTransaction(config_, (error, hash) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(hash)
                }
            })
        })
    }, [web3, account, chainId, stringify(config), gasConfig])
}
