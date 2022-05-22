import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../utils/checkAvailability'
import type { EVM_Connection } from '@masknet/plugin-evm'
import { useAccount, useChainId, Web3Helper, useWeb3Connection } from '@masknet/plugin-infra/web3'

export function useAvailability(
    id: string,
    contractAddress: string,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId }) as EVM_Connection

    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const isV1 = isSameAddress(contractAddress ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contractAddress) return null
        return checkAvailability(id, account, contractAddress, chainId, connection, isV1)
    }, [id, account, chainId, connection, isV1, contractAddress])
}
