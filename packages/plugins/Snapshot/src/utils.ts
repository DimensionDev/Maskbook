import type { Proposal } from './types.js'

type VoteTypes = {
    Vote: [
        { name: 'from'; type: string },
        { name: 'space'; type: string },
        { name: 'timestamp'; type: string },
        { name: 'proposal'; type: string },
        { name: 'choice'; type: 'uint32' | 'string' | 'uint32[]' },
        { name: 'reason'; type: string },
        { name: 'app'; type: string },
        { name: 'metadata'; type: string },
    ]
}

export function formatChoice(defType: 'uint32' | 'string' | 'uint32[]', choiceIndexes: number[]) {
    if (defType === 'uint32') return choiceIndexes[0]
    if (defType === 'string') return choiceIndexes[0].toString()

    return choiceIndexes
}

const voteTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'uint32' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

const voteStringTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

const vote2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'uint32' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

const voteArray2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'uint32[]' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

const voteString2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

const voteArrayTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'uint32[]' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
} satisfies VoteTypes

export function getSnapshotVoteTypes(type: string, proposalId: string, privacy: string): VoteTypes {
    const isType2 = proposalId.startsWith('0x')

    let types: VoteTypes = isType2 ? vote2Types : voteTypes
    if (['approval', 'ranked-choice'].includes(type)) {
        types = isType2 ? voteArray2Types : voteArrayTypes
    }
    const isShutter = privacy === 'shutter'

    if (!isShutter && ['quadratic', 'weighted'].includes(type)) {
        types = isType2 ? voteString2Types : voteStringTypes
    }
    if (isShutter) types = isType2 ? voteString2Types : voteStringTypes

    return types
}

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
