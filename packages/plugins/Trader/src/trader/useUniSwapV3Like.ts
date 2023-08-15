import { useMemo } from 'react'
import { TradeProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useCustomBlockBeatRetry, useNetwork } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { UniSwapV3Like } from '@masknet/web3-providers'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { getEVMAvailableTraderProviders } from '../utils.js'

export function useUniswapV3Like(
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
        if (!providers.includes(TradeProvider.UNISWAP_V3)) return
        return new UniSwapV3Like()
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
