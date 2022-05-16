import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/src/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxPurchasedTokens(id: string | number, customer: string) {
    const chainId= useChainId(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract(chainId)
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return EMPTY_LIST
        return maskBoxContract.methods.getPurchasedNft(id, customer).call()
    }, [id, customer, maskBoxContract])
}
