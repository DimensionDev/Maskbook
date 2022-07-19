import {
    ChainId,
    chainResolver,
    isNativeTokenAddress,
    NetworkType,
    SchemaType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@dimensiondev/kit'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapQuoteResponse, TradeStrategy } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useAccount, useDoubleBlockBeatRetry, useNetworkType } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { FungibleToken, NetworkPluginID, isZero } from '@masknet/web3-shared-base'

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export function getNativeTokenLabel(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
        case NetworkType.Polygon:
        case NetworkType.Arbitrum:
        case NetworkType.xDai:
        case NetworkType.Celo:
        case NetworkType.Fantom:
        case NetworkType.Aurora:
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Avalanche:
        case NetworkType.Optimistic:
        case NetworkType.Harmony:
        case NetworkType.Conflux:
        case NetworkType.Astar:
            return NATIVE_TOKEN_ADDRESS
        default:
            safeUnreachable(networkType)
            return ''
    }
}

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): AsyncStateRetry<SwapQuoteResponse | null> {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(targetChainId)

    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken) return null
            const isExactIn = strategy === TradeStrategy.ExactIn
            if (isZero(inputAmount) && isExactIn) return null
            if (isZero(outputAmount) && !isExactIn) return null

            const sellToken = isNativeTokenAddress(inputToken)
                ? getNativeTokenLabel(chainResolver.chainNetworkType(targetChainId) ?? networkType)
                : inputToken.address
            const buyToken = isNativeTokenAddress(outputToken)
                ? getNativeTokenLabel(chainResolver.chainNetworkType(targetChainId) ?? networkType)
                : outputToken.address
            return PluginTraderRPC.swapQuote(
                {
                    sellToken,
                    buyToken,
                    takerAddress: account,
                    sellAmount: isExactIn ? inputAmount : void 0,
                    buyAmount: isExactIn ? void 0 : outputAmount,
                    skipValidation: true,
                    slippagePercentage: slippage,
                    affiliateAddress: ZRX_AFFILIATE_ADDRESS,
                },
                chainResolver.chainNetworkType(targetChainId) ?? networkType,
            )
        },
        [
            NATIVE_TOKEN_ADDRESS,
            networkType,
            account,
            strategy,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
            slippage,
        ],
    )
}
