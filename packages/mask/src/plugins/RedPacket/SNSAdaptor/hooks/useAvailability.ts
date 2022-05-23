import { useAsyncRetry } from 'react-use'
import type { EVM_Connection } from '@masknet/plugin-evm'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import { useRedPacketContract } from './useRedPacketContract'
import { useAccount, useChainId, Web3Helper, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useAvailability(
    id: string,
    contract_address: string,
    version: number,
    options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId }) as EVM_Connection | null

    return useAsyncRetry(async () => {
        if (!id || !connection || !contract_address || !redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, chainId, connection, contract_address, version])
}
