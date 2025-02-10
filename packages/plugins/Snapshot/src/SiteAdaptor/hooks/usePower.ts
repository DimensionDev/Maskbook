import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { PluginSnapshotRPC } from '../../messages.js'
import type { ProposalIdentifier } from '../../types.js'

export function usePower(identifier: ProposalIdentifier) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useQuery({
        enabled: !!account,
        queryKey: ['plugin', 'snapshot', 'getVp', account, identifier.id, identifier.space],
        queryFn: () => PluginSnapshotRPC.getVp(account, identifier.space, identifier.id),
        select: (data) => data?.vp,
    })
}
