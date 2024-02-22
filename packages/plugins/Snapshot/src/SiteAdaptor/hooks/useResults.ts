import type { Proposal, ProposalIdentifier, ProposalResult, VoteItem } from '../../types.js'
import { useVotes } from './useVotes.js'
import { sumBy } from 'lodash-es'

export function useResults(identifier: ProposalIdentifier, proposal: Proposal) {
    const votes = useVotes({ id: identifier.id, space: identifier.space })
    const strategies = proposal.strategies
    const powerOfChoices = proposal.choices.map((_choice, index) =>
        sumBy(voteForChoice(votes, index), (choice) => {
            if (choice.choiceIndex) return choice.balance
            const totalWeight = sumBy(choice.choices, (choice) => choice.weight)
            const weight = choice.choices!.find((v) => v.index === index + 1)?.weight ?? 0
            return (choice.balance * weight) / totalWeight
        }),
    )
    const powerDetailOfChoices = proposal.choices.map((_choice, i) =>
        strategies.map((_strategy, index) => sumBy(voteForChoice(votes, i), (vote) => vote.scores[index])),
    )
    const totalPower = sumBy(votes, (vote) => vote.balance)

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
