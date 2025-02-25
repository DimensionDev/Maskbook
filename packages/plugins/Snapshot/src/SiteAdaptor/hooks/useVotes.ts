import type { ProposalIdentifier, VoteItem } from '../../types.js'
import { useProposal } from './useProposal.js'
import { sumBy } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getScores } from '../../utils.js'

export function useVotes(identifier: ProposalIdentifier, account?: string) {
    const proposal = useProposal(identifier.id)
    const strategies = proposal.strategies
    const scores = getScores(proposal)
    return proposal.votes
        .map((v): VoteItem => {
            const choices =
                typeof v.choice === 'number' ? undefined
                : Array.isArray(v.choice) ?
                    v.choice.map((i) => ({
                        weight: 1,
                        name: proposal.choices[i - 1],
                        index: Number(i),
                    }))
                :   Object.entries(v.choice).map(([i, weight]) => ({
                        weight,
                        name: proposal.choices[Number(i) - 1],
                        index: Number(i),
                    }))
            return {
                choiceIndex: typeof v.choice === 'number' ? v.choice : undefined,
                choiceIndexes: typeof v.choice === 'number' ? undefined : Object.keys(v.choice).map(Number),
                choice: typeof v.choice === 'number' ? proposal.choices[v.choice - 1] : undefined,
                choices,
                totalWeight:
                    choices ?
                        Array.isArray(v.choice) ?
                            v.choice.length
                        :   sumBy(choices, (choice) => choice.weight)
                    :   undefined,
                address: v.voter,
                authorIpfsHash: v.ipfs ?? v.id,
                balance: v.vp || sumBy(scores, (score) => score[v.voter.toLowerCase()] ?? 0),
                scores: scores.map((score) => score[v.voter.toLowerCase()] || 0),
                strategySymbol: proposal.space.symbol ?? strategies[0].params.symbol,
                timestamp: v.created,
            }
        })
        .sort((a, b) => (isSameAddress(a.address, account) ? -1 : b.balance - a.balance))
        .filter((v) => v.balance > 0)
}
