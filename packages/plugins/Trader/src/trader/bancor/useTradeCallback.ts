import { pick } from 'lodash-es'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { ZERO } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { Bancor } from '../../providers/index.js'
import type { SwapBancorRequest } from '../../types/index.js'

export function useTradeCallback(
    tradeComputed: TraderAPI.TradeComputed<SwapBancorRequest> | null,
    gasConfig?: GasConfig,
) {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !trade || pluginID !== NetworkPluginID.PLUGIN_EVM) return

        try {
            const data = await Bancor.swapTransactionBancor(trade)

            // Note that if approval is required, the API will also return the necessary approval transaction.
            const tradeTransaction = data.length === 1 ? data[0] : data[1]

            const config = pick(tradeTransaction.transaction, ['to', 'data', 'from', 'value'])
            const gas = await Web3.estimateTransaction?.(config, undefined, {
                chainId,
            })
            const config_ = {
                ...config,
                gas: gas ?? ZERO.toString(),
            }

            // send transaction and wait for hash

            const hash = await Web3.sendTransaction(config_, { chainId, overrides: { ...gasConfig } })
            const receipt = await Web3.getTransactionReceipt(hash, {
                chainId,
            })

            if (!receipt?.status) return

            return receipt?.transactionHash
        } catch (error) {
            return
        }
    }, [account, chainId, stringify(trade), gasConfig, pluginID])
}
