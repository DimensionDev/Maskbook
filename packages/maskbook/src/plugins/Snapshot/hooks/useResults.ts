import type { ProposalIdentifier, ProposalResult, ProposalMessage, Votes } from '../types'
import { useSuspense } from '../../../utils/hooks/useSuspense'
import { useProposal } from './useProposal'
import { useVotes } from './useVotes'

const cache = new Map<string, [0, Promise<void>] | [1, ProposalResult] | [2, Error]>()
export function resultsErrorRetry() {
    cache.forEach(([status], id) => status === 2 && cache.delete(id))
}
export function useResults(identifier: ProposalIdentifier) {
    return useSuspense<ProposalResult, [ProposalIdentifier]>(identifier.id, [identifier], cache, Suspender)
}

async function Suspender(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const message: ProposalMessage = JSON.parse(proposal.msg)
    const strategies = message.payload.metadata.strategies
    const results: ProposalResult = {
        voteNumberOfChoices: message.payload.choices.map((_choice, i) => voteForChoice(votes, i).length),
        powerOfChoices: message.payload.choices.map((_choice, i) =>
            voteForChoice(votes, i).reduce((a, b) => a + b.balance, 0),
        ),
        powerDetailOfChoices: message.payload.choices.map((_choice, i) =>
            strategies.map((_strategy, sI) => voteForChoice(votes, i).reduce((a, b) => a + b.scores[sI], 0)),
        ),
        totalPower: Object.values(votes).reduce((a, b) => a + b.balance, 0),
    }

    return results
}

function voteForChoice(votes: Votes, i: number) {
    return Object.values(votes).filter((vote) => vote.msg.payload.choice === i + 1)
}
