import type { VoteItem, ProposalIdentifier } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { sumBy } from 'lodash-unified'
import { getScores } from '../../utils'

const cache = new Map<string, [0, Promise<void>] | [1, VoteItem[]] | [2, Error]>()
export function votesRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useVotes(identifier: ProposalIdentifier) {
    return useSuspense<VoteItem[], [ProposalIdentifier]>(identifier.id, [identifier], cache, Suspender)
}
async function Suspender(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)

    const scores = getScores(proposal)
    const strategies = proposal.strategies
    return proposal.votes
        .map((v): VoteItem => {
            const choices =
                typeof v.choice === 'number'
                    ? undefined
                    : Array.isArray(v.choice)
                    ? v.choice.map((i) => ({
                          weight: 1,
                          name: proposal.choices[i - 1],
                          index: Number(i),
                      }))
                    : Object.entries(v.choice).map(([i, weight]) => ({
                          weight,
                          name: proposal.choices[Number(i) - 1],
                          index: Number(i),
                      }))
            return {
                choiceIndex: typeof v.choice === 'number' ? v.choice : undefined,
                choiceIndexes: typeof v.choice === 'number' ? undefined : Object.keys(v.choice).map(Number),
                choice: typeof v.choice === 'number' ? proposal.choices[v.choice - 1] : undefined,
                choices,
                totalWeight: choices
                    ? Array.isArray(v.choice)
                        ? v.choice.length
                        : sumBy(choices, (choice) => choice.weight)
                    : undefined,
                address: v.voter,
                authorIpfsHash: v.ipfs ?? v.id,
                balance: sumBy(scores, (score) => score[v.voter.toLowerCase()] ?? 0),
                scores: scores.map((score) => score[v.voter.toLowerCase()] || 0),
                strategySymbol: proposal.space.symbol ?? strategies[0].params.symbol,
                timestamp: v.created,
            }
        })
        .sort((a, b) => b.balance - a.balance)
        .filter((v) => v.balance > 0)
}
