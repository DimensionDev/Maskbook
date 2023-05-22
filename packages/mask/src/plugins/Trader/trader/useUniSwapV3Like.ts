import { TradeProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useCustomBlockBeatRetry } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useMemo } from 'react'
import { UniSwapV3Like } from '@masknet/web3-providers'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { getEVMAvailableTraderProviders } from '../utils.js'
import { BLOCK_TIME_SCALE } from '../constants/trader.js'
import type { TraderAPI } from '@masknet/web3-providers/types'

export function useUniswapV3Like(
    inputAmount_: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
    isNativeTokenWrapper?: boolean,
) {
    const { chainId, account, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const slippageSetting = useSlippageTolerance()

    const slippage = useMemo(() => {
        return temporarySlippage ? temporarySlippage : slippageSetting
    }, [temporarySlippage, slippageSetting])

    const provider = useMemo(() => {
        const providers = getEVMAvailableTraderProviders(networkType as NetworkType)
        if (!providers.includes(TradeProvider.UNISWAP_V3)) return
        return new UniSwapV3Like()
    }, [networkType])
    return useCustomBlockBeatRetry<NetworkPluginID.PLUGIN_EVM, TraderAPI.TradeInfo | undefined | null>(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!provider) return
            return isNativeTokenWrapper
                ? provider.getNativeWrapperTradeInfo(chainId as ChainId, account, inputAmount_, inputToken, outputToken)
                : provider.getTradeInfo(chainId as ChainId, account, inputAmount_, slippage, inputToken, outputToken)
        },
        [inputAmount_, isNativeTokenWrapper, chainId, account, provider, inputToken, outputToken],
        BLOCK_TIME_SCALE[chainId],
    )
}
