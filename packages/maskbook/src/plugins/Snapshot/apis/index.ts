import type { Vote, Proposal } from '../types'

export async function fetchProposal(id: string) {
    const response = await fetch(`https://ipfs.io/ipfs/${id}`, {
        method: 'GET',
    })
    return (await response.json()) as Proposal
}

export function fetchAllProposalsOfSpace() {}

export async function fetchAllVotesOfProposal(id: string, space: string) {
    const response = await fetch(`https://hub.snapshot.page/api/${space}/proposal/${id}`, {
        method: 'GET',
    })
    const result = await response.json()
    console.log('fetchAllVotesOfProposal', result)
    return result as {
        [key in string]: Vote
    }
}
