import type { ProposalIdentifier, ProposalResult, VoteItem } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useVotes } from './useVotes'

const cache = new Map<
    string,
    [0, Promise<void>] | [1, { results: ProposalResult[]; totalPower: number }] | [2, Error]
>()
export function resultsRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useResults(identifier: ProposalIdentifier) {
    return useSuspense<{ results: ProposalResult[]; totalPower: number }, [ProposalIdentifier]>(
        identifier.id,
        [identifier],
        cache,
        Suspender,
    )
}

async function Suspender(identifier: ProposalIdentifier) {
    const {
        payload: { message, proposal },
    } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const strategies = message.payload.metadata.strategies ?? proposal.strategies
    const powerOfChoices = message.payload.choices.map((_choice, i) =>
        voteForChoice(votes, i).reduce((a, b) => {
            if (b.choiceIndex) {
                return a + b.balance
            } else {
                const totalWeight = b.choices!.reduce((_totalWeight, inner_b) => _totalWeight + inner_b.weight, 0)
                return a + (b.balance * (b.choices!.find((v) => v.index === i + 1)?.weight ?? 0)) / totalWeight
            }
        }, 0),
    )
    const powerDetailOfChoices = message.payload.choices.map((_choice, i) =>
        strategies.map((_strategy, sI) => voteForChoice(votes, i).reduce((a, b) => a + b.scores[sI], 0)),
    )
    const totalPower = votes.reduce((a, b) => a + b.balance, 0)

    const results: ProposalResult[] = powerOfChoices.map((p, i) => ({
        choice: message.payload.choices[i],
        power: p,
        powerDetail: powerDetailOfChoices[i].map((inner_p, pI) => ({
            power: strategies.length === 1 ? p : inner_p,
            name: strategies[pI].params.symbol,
        })),
        percentage: totalPower === 0 ? 0 : (p / totalPower) * 100,
    }))
    return { results: results.sort((a, b) => b.power - a.power), totalPower }
}

function voteForChoice(votes: VoteItem[], i: number) {
    return votes.filter((vote) => (vote.choiceIndex ? vote.choiceIndex === i + 1 : vote.choiceIndexes?.includes(i + 1)))
}
