import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ProposalIdentifier } from '../../types'
import { useProposal } from './useProposal'
import { find, sumBy } from 'lodash-unified'
import { getScores } from '../../utils'

export function usePower(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!account) return 0
        const scores = getScores(proposal)
        return sumBy(scores, (score) => find(score, (_, key) => key.toLowerCase() === account.toLowerCase()) ?? 0)
    }, [account])
}
