import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginSnapshotRPC } from '../../messages.js'
import type { ProposalIdentifier } from '../../types.js'
import { useProposal } from './useProposal.js'
import { find, sumBy } from 'lodash-unified'

export function usePower(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!account) return 0
        const scores = await PluginSnapshotRPC.getScores(
            proposal.snapshot,
            [account],
            proposal.network,
            identifier.space,
            proposal.strategies,
        )
        return sumBy(scores, (score) => find(score, (_, key) => key.toLowerCase() === account.toLowerCase()) ?? 0)
    }, [account])
}
