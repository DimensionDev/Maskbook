import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig, Transaction } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import type { SwapRouteSuccessResponse } from '../../types/index.js'

export function useTradeCallback(
    tradeComputed: TraderAPI.TradeComputed<SwapRouteSuccessResponse> | null,
    gasConfig?: GasConfig,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !config || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }

        try {
            const gas = await EVMWeb3.estimateTransaction?.(config, undefined, {
                chainId,
            })
            const hash = await EVMWeb3.sendTransaction(
                {
                    ...config,
                    gas,
                },
                { chainId, overrides: { ...gasConfig } },
            )
            const receipt = await EVMWeb3.confirmTransaction(hash, { chainId })
            return receipt.transactionHash
        } catch (error) {
            return
        }
    }, [account, chainId, stringify(config), gasConfig, pluginID])
}
