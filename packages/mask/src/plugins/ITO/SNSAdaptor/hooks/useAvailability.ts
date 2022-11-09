import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useITOConstants } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { checkAvailability } from '../utils/checkAvailability.js'

export function useAvailability(
    id: string,
    contractAddress: string,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const isV1 = isSameAddress(contractAddress ?? '', ITO_CONTRACT_ADDRESS)

    return useAsyncRetry(async () => {
        if (!id || !contractAddress || !connection) return null
        return checkAvailability(id, account, contractAddress, chainId, connection, isV1)
    }, [id, account, chainId, connection, isV1, contractAddress])
}
