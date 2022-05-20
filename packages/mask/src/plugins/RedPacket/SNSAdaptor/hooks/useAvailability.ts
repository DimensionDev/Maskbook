import { useAsyncRetry } from 'react-use'
import type { EVM_Connection } from '@masknet/plugin-evm'
import { useAccount, useChainId, Web3Helper, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { checkAvailability } from '../utils/checkAvailability'

export function useAvailability(
    id: string,
    contract_address: string,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId }) as EVM_Connection | null

    return useAsyncRetry(async () => {
        if (!id || !connection) return null
        return checkAvailability(id, account, contract_address, chainId, connection)
    }, [id, account, chainId, connection])
}
