import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { find, omit, sumBy } from 'lodash-es'
import { useMemo } from 'react'
import type { Proposal, ProposalIdentifier, ScoreResponse } from '../../types.js'
import { getScores } from '../../utils.js'
import { useProposal } from './useProposal.js'

export function useMyScore(account: string, proposal: Proposal) {
    const { network, snapshot, space, strategies } = proposal
    const { data: score } = useQuery({
        queryKey: ['snapshot', 'user-score', account, network, space.id, snapshot],
        queryFn: async () => {
            const res = await fetchJSON<ScoreResponse>('https://score.snapshot.org/api/scores', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    params: {
                        addresses: [account],
                        space: space.id,
                        network,
                        snapshot,
                        strategies: strategies.map((x) => omit(x, ['network', '__typename'])),
                    },
                }),
            })
            return res.result.scores
        },
        select(scores) {
            return scores.reduce((total, record) => {
                const entry = Object.entries(record).find(([key]) => isSameAddress(key, account))
                return entry ? entry[1] + total : total
            }, 0)
        },
    })
    return score
}

export function usePower(identifier: ProposalIdentifier) {
    const proposal = useProposal(identifier.id)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const score = useMyScore(account, proposal) || 0
    const votedScore = useMemo(() => {
        if (!account || !proposal) return 0
        const scores = getScores(proposal)
        return sumBy(scores, (score) => find(score, (_, key) => isSameAddress(key, account)) ?? 0)
    }, [account, proposal])
    return score + votedScore
}
