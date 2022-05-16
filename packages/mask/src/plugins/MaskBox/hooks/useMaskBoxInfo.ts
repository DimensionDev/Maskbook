import { useChainId } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxInfo(id: string | number) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract(chainId)
    return useAsyncRetry(async () => {
        if (!maskBoxContract) return null
        return maskBoxContract.methods.getBoxInfo(id).call()
    }, [id, maskBoxContract])
}
