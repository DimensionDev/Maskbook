import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxTokensForSale(id: string | number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract(chainId)
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return []
        return maskBoxContract.methods.getNftListForSale(id, 0, 100).call()
    }, [id, maskBoxContract])
}
