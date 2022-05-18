import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../../Worker/apis/checkAvailability'
import { useAccount, useChainId, Web3Helper } from '@masknet/plugin-infra/web3'

export function useAvailability(
    id: string,
    contractAddress: string,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)

    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const isV1 = isSameAddress(contractAddress ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contractAddress) return null
        return checkAvailability(id, account, contractAddress, chainId, isV1)
    }, [id, account, chainId, isV1, contractAddress])
}
