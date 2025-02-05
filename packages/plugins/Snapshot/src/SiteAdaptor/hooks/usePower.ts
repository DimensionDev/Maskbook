import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ProposalIdentifier } from '../../types.js'
import { useProposal } from './useProposal.js'
import { find, sumBy } from 'lodash-es'
import { getScores } from '../../utils.js'
import { useMemo } from 'react'

export function usePower(identifier: ProposalIdentifier) {
    const proposal = useProposal(identifier.id)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useMemo(() => {
        if (!account) return 0
        const scores = getScores(proposal)
        return sumBy(scores, (score) => find(score, (_, key) => key.toLowerCase() === account.toLowerCase()) ?? 0)
    }, [account, proposal])
}
