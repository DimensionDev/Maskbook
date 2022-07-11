import { first } from 'lodash-unified'
import {
    ChainId,
    isNativeTokenAddress,
    SchemaType,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { SwapOOData, TradeStrategy } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useSlippageTolerance } from './useSlippageTolerance'
import { OPENOCEAN_SUPPORTED_CHAINS } from './constants'
import { useAccount, useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { FungibleToken, NetworkPluginID, isZero } from '@masknet/web3-shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): AsyncStateRetry<SwapOOData | null> {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { RPC_URLS } = useRPCConstants(targetChainId)
    const providerURL = first(RPC_URLS)
    const { OPENOCEAN_ETH_ADDRESS } = useTraderConstants(targetChainId)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!OPENOCEAN_SUPPORTED_CHAINS.includes(targetChainId)) return null
            if (!inputToken || !outputToken) return null
            if (isZero(inputAmount)) return null
            const sellToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
                : inputToken
            const buyToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
                : outputToken
            return PluginTraderRPC.swapOO({
                isNativeSellToken: isNativeTokenAddress(inputToken.address),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage,
                userAddr: account,
                rpc: providerURL,
                chainId: targetChainId,
            })
        },
        [
            NATIVE_TOKEN_ADDRESS,
            strategy,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
            slippage,
            account,
            providerURL,
            targetChainId,
        ],
    )
}
