import { useAsyncRetry } from 'react-use'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useTokenConstant } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTrade(inputToken?: Web3Helper.FungibleTokenAll, outputToken?: Web3Helper.FungibleTokenAll) {
    const { chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const WNATIVE_ADDRESS = useTokenConstant(targetChainId, 'WNATIVE_ADDRESS')
    const Others = useWeb3Others()

    // to mimic the same interface with other trade providers
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken || pluginID !== NetworkPluginID.PLUGIN_EVM) return false
        // none of the tokens is native token
        if (!Others.isNativeTokenSchemaType(inputToken.schema) && !Others.isNativeTokenSchemaType(outputToken.schema))
            return false
        // none of the tokens is wrapped native token
        if (!isSameAddress(inputToken.address, WNATIVE_ADDRESS) && !isSameAddress(outputToken.address, WNATIVE_ADDRESS))
            return false
        return true
    }, [WNATIVE_ADDRESS, inputToken, outputToken, pluginID, Others.isNativeTokenSchemaType])
}
