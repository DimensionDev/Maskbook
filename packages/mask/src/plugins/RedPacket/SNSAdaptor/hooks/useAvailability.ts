import { useAsyncRetry } from 'react-use'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3ConnectionOptions } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useAvailability(
    id: string,
    contract_address: string,
    version: number,
    options?: Web3ConnectionOptions,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncRetry(async () => {
        if (!id || !connection || !contract_address || !redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, chainId, connection, contract_address, version])
}
