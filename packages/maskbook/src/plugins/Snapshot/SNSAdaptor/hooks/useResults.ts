import type { ProposalIdentifier, ProposalResult, VoteItemList } from '../../types'
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
        payload: { message },
    } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const strategies = message.payload.metadata.strategies
    const voteNumberOfChoices = message.payload.choices.map((_choice, i) => voteForChoice(votes, i).length)
    const powerOfChoices = message.payload.choices.map((_choice, i) =>
        voteForChoice(votes, i).reduce((a, b) => a + b.balance, 0),
    )
    const powerDetailOfChoices = message.payload.choices.map((_choice, i) =>
        strategies.map((_strategy, sI) => voteForChoice(votes, i).reduce((a, b) => a + b.scores[sI], 0)),
    )
    const totalPower = Object.values(votes).reduce((a, b) => a + b.balance, 0)

    const results: ProposalResult[] = powerOfChoices
        .map((p, i) => ({
            choice: message.payload.choices[i],
            power: p,
            voteNumber: voteNumberOfChoices[i],
            powerDetail: powerDetailOfChoices[i].map((p, pI) => ({
                power: p,
                name: message.payload.metadata.strategies[pI].params.symbol,
            })),
            percentage: totalPower === 0 ? 0 : (p / totalPower) * 100,
        }))
        .sort((a, b) => b.power - a.power)

    return { results, totalPower }
}

function voteForChoice(votes: VoteItemList, i: number) {
    return Object.values(votes).filter((vote) => vote.msg.payload.choice === i + 1)
}
