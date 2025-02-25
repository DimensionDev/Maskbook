import type { ChainId } from '@masknet/web3-shared-evm'
import { SNAPSHOT_RELAY_URL, SNAPSHOT_SEQ_URL } from '../constants.js'
import type { HubProposal, Proposal, RawVote, VoteResult } from '../types.js'
import { formatBoxProposal, fetchProposalFromBoxApi, fetchVotesFromBox, formatBoxVote } from './box.js'

export async function fetchProposal(id: string) {
    const proposal = await fetchProposalFromGraphql(id)
    const votes = await fetchVotesFromGraphql(id, 500, 0, proposal.space.id)
    const now = Date.now()
    const isStart = proposal.start * 1000 < now
    const isEnd = proposal.end * 1000 < now
    return {
        ...proposal,
        voterAmounts: votes.length,
        address: proposal.author,
        isStart,
        isEnd,
        votes,
        chainId: Number(proposal.network) as ChainId,
    } as unknown as Proposal
}

async function fetchVotesFromGraphql(id: string, first: number, skip: number, space: string) {
    if (id.includes('/')) {
        const res = await fetchVotesFromBox(id.split('/').pop()!, first, skip, space)
        return res.votes.map(formatBoxVote)
    }
    const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Votes',
            query: `query Votes(
                $id: String!,
                $first: Int,
                $skip: Int,
                $orderBy: String,
                $orderDirection: OrderDirection,
                $voter: String,
                $space: String
            ) {
                votes(
                    first: $first
                    skip: $skip
                    where: {proposal: $id, vp_gt: 0, voter: $voter, space: $space}
                    orderBy: $orderBy
                    orderDirection: $orderDirection
                ) {
                    ipfs
                    voter
                    choice
                    vp
                    vp_by_strategy
                    reason
                    created
                }
            }`,
            variables: {
                id,
                first,
                skip,
                // vote power
                orderBy: 'vp',
                orderDirection: 'desc',
                space,
            },
        }),
    })

    interface Res {
        data: {
            votes: RawVote[]
        }
    }
    const res: Res = await response.json()

    return res.data.votes
}

async function fetchProposalFromGraphql(id: string): Promise<HubProposal> {
    if (id.includes('/')) {
        const proposal = await fetchProposalFromBoxApi(id)
        return formatBoxProposal(proposal.proposal)
    }
    const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Proposal',
            query: /* GraphQL */ `
                query Proposal($id: String!) {
                    proposal(id: $id) {
                        id
                        ipfs
                        title
                        body
                        discussion
                        choices
                        start
                        end
                        snapshot
                        state
                        author
                        created
                        plugins
                        symbol
                        scores
                        scores_total
                        scores_by_strategy
                        network
                        type
                        votes
                        privacy
                        strategies {
                            name
                            params
                            network
                            __typename
                        }
                        space {
                            id
                            name
                            symbol
                            avatar
                        }
                    }
                }
            `,
            variables: {
                id,
            },
        }),
    })
    interface Res {
        data: {
            proposal: HubProposal
        }
    }

    const res: Res = await response.json()
    return res.data.proposal
}

export async function vote(body: string, useRelay: boolean) {
    const response = await fetch(useRelay ? SNAPSHOT_RELAY_URL : SNAPSHOT_SEQ_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    })

    const result: VoteResult = await response.json()
    return result
}

interface VpResponse {
    data?: {
        vp: {
            vp: number
            vp_by_strategy: number[]
            vp_state: string
        }
    }
}
export async function getVp(voter: string, space: string, proposal: string) {
    const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'VotePower',
            query: /* GraphQL */ `
                query VotePower($voter: String!, $space: String!, $proposal: String!) {
                    vp(voter: $voter, space: $space, proposal: $proposal) {
                        vp
                        vp_by_strategy
                        vp_state
                    }
                }
            `,
            variables: {
                voter,
                space,
                proposal,
            },
        }),
    })
    const result: VpResponse = await response.json()
    return result.data?.vp
}
