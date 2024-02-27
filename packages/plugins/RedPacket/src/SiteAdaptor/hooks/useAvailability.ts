import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { BaseConnectionOptions } from '@masknet/web3-providers/types'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useRedPacketContract } from './useRedPacketContract.js'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

type T = UseQueryResult
export function useAvailability(
    id: string,
    version: number,
    options?: BaseConnectionOptions<ChainId, ProviderType, Transaction>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4
    return useQuery({
        queryKey: ['red-packet', 'check-availability', chainId, version, id, account],
        queryFn: async () => {
            if (!id || !redPacketContract) return null
            return redPacketContract.methods.check_availability(id).call({
                // check availability is ok w/o account
                from: account,
            })
        },
        refetchInterval(query) {
            const { data } = query.state
            if (!data) return 30_000
            if (data.expired || !data.balance) return false
            return 30_000
        },
    })
}
