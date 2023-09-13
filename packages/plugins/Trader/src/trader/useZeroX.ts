import { useMemo } from 'react'
import { TradeProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useCustomBlockBeatRetry, useNetwork } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { getEVMAvailableTraderProviders } from '../helpers/index.js'
import { ZeroX } from '../providers/index.js'

export function useZeroX(
    inputAmount_: string,
    scale: number,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
    isNativeTokenWrapper?: boolean,
) {
    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const network = useNetwork()
    const slippageSetting = useSlippageTolerance()

    const slippage = useMemo(() => {
        return temporarySlippage ? temporarySlippage : slippageSetting
    }, [temporarySlippage, slippageSetting])

    const provider = useMemo(() => {
        if (!network) return
        const providers = getEVMAvailableTraderProviders(network.type as NetworkType)
        if (!providers.includes(TradeProvider.ZRX)) return
        return ZeroX
    }, [network])

    return useCustomBlockBeatRetry<NetworkPluginID.PLUGIN_EVM, TraderAPI.TradeInfo | undefined | null>(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!provider) return
            return isNativeTokenWrapper
                ? provider.getNativeWrapperTradeInfo(chainId as ChainId, account, inputAmount_, inputToken, outputToken)
                : provider.getTradeInfo(chainId as ChainId, account, inputAmount_, slippage, inputToken, outputToken)
        },
        [inputAmount_, isNativeTokenWrapper, chainId, account, provider, inputToken, outputToken],
        scale,
    )
}
