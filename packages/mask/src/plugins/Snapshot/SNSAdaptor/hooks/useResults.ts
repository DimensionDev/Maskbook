import type { ProposalIdentifier, ProposalResult, VoteItem } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useVotes } from './useVotes'
import { sum } from 'lodash-unified'

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
    const { payload: proposal } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const strategies = proposal.strategies
    const powerOfChoices = proposal.choices.map((_choice, index) =>
        sum(
            voteForChoice(votes, index).map((choice) => {
                if (choice.choiceIndex) return choice.balance
                const totalWeight = sum(choice.choices!.map((choice) => choice.weight))
                const weight = choice.choices!.find((v) => v.index === index + 1)?.weight ?? 0
                return (choice.balance * weight) / totalWeight
            }),
        ),
    )
    const powerDetailOfChoices = proposal.choices.map((_choice, i) =>
        strategies.map((_strategy, index) => sum(voteForChoice(votes, i).map((vote) => vote.scores[index], 0))),
    )
    const totalPower = sum(votes.map((vote) => vote.balance))

    const results: ProposalResult[] = powerOfChoices.map((p, i) => ({
        choice: proposal.choices[i],
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
    return votes.filter((vote) =>
        vote.choiceIndex ? vote.choiceIndex === i + 1 : vote.choices?.map((c) => c.index)?.includes(i + 1),
    )
}
