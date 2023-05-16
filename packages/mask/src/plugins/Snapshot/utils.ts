import type { Proposal } from './types'

export const getSnapshotVoteType = (type: string) => ({
    Vote: [
        {
            name: 'from',
            type: 'address',
        },
        {
            name: 'space',
            type: 'string',
        },
        {
            name: 'timestamp',
            type: 'uint64',
        },
        {
            name: 'proposal',
            type: 'string',
        },
        {
            name: 'choice',
            type: type === 'single-choice' ? 'uint32' : 'uint32[]',
        },
        {
            name: 'metadata',
            type: 'string',
        },
    ],
})

export function getScores(proposal: Proposal) {
    const scores = []
    for (let i = 0; i < proposal.choices.length; i += 1) {
        const score: Record<string, number> = {}
        for (const vote of proposal.votes) {
            if (vote.vp_by_strategy[i] > 0) score[vote.voter.toLowerCase()] = vote.vp_by_strategy[i]
        }
        scores.push(score)
    }

    return scores
}
