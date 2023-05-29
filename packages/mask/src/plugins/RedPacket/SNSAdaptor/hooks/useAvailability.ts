import { useAsyncRetry } from 'react-use'
import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { ConnectionOptions_Base } from '@masknet/web3-providers/types'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useAvailability(
    id: string,
    contract_address: string,
    version: number,
    options?: ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4

    return useAsyncRetry(async () => {
        if (!id || !contract_address || !redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, contract_address, redPacketContract])
}
