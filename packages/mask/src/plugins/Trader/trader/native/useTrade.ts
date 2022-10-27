import { useAsyncRetry } from 'react-use'
import { FungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import { SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTrade(
    inputToken?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    outputToken?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
) {
    const { chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    // to mimic the same interface with other trade providers
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken || pluginID !== NetworkPluginID.PLUGIN_EVM) return false
        // none of the tokens is native token
        if (inputToken.schema !== SchemaType.Native && outputToken.schema !== SchemaType.Native) return false
        // none of the tokens is wrapped native token
        if (!isSameAddress(inputToken.address, WNATIVE_ADDRESS) && !isSameAddress(outputToken.address, WNATIVE_ADDRESS))
            return false
        return true
    }, [WNATIVE_ADDRESS, inputToken, outputToken, pluginID])
}
