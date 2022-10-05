import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { checkAvailability } from '../utils/checkAvailability.js'

export function useAvailability(
    id: string,
    contractAddress: string,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const isV1 = isSameAddress(contractAddress ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contractAddress || !connection) return null
        return checkAvailability(id, account, contractAddress, chainId, connection, isV1)
    }, [id, account, chainId, connection, isV1, contractAddress])
}
