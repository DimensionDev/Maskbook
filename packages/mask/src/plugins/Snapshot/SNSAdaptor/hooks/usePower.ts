import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginSnapshotRPC } from '../../messages'
import type { ProposalIdentifier } from '../../types'
import { useProposal } from './useProposal'
import { mapKeys } from 'lodash-unified'

export function usePower(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!account) return 0
        return (
            await PluginSnapshotRPC.getScores(
                proposal.snapshot,
                [account],
                proposal.network,
                identifier.space,
                proposal.strategies,
            )
        )
            .map((v) => mapKeys(v, (_value, key) => key.toLowerCase()) as { [x: string]: number })
            .reduce((acc, cur) => {
                return acc + (cur[account.toLowerCase()] ?? 0)
            }, 0)
    }, [account])
}
