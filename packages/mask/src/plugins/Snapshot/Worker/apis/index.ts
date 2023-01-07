import ss from '@snapshot-labs/snapshot.js'
import type { Proposal, VoteSuccess, Strategy } from '../../types.js'
import { transform } from 'lodash-es'
import { SNAPSHOT_GET_SCORE_API } from '../../constants.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export async function fetchProposal(id: string) {
    const { proposal } = await fetchProposalFromGraphql(id)
    const { votes } = await fetchVotesFromGraphql(id, 500, 0, proposal.space.id)
    const now = Date.now()
    const isStart = proposal.start * 1000 < now
    const isEnd = proposal.end * 1000 < now
    return {
        ...proposal,
        voterAmounts: proposal.votes,
        address: proposal.author,
        isStart,
        isEnd,
        votes,
        chainId: Number(proposal.network) as ChainId,
    } as unknown as Proposal
}

async function fetchVotesFromGraphql(id: string, first: number, skip: number, space: string) {
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

    const { data }: Res = await response.json()

    interface Res {
        data: {
            votes: Array<{
                ipfs: string
                choice: number | { [choiceIndex: number]: number } | number[]
                created: number
                vp: number
                vp_by_strategy: number[]
            }>
        }
    }

    return data
}

async function fetchProposalFromGraphql(id: string) {
    const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Proposal',
            query: `query Proposal($id: String!) {
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
            }`,
            variables: {
                id,
            },
        }),
    })
    interface Res {
        data: {
            proposal: {
                author: string
                body: string
                discussion: string
                votes: number
                choices: string[]
                created: number
                end: number
                start: number
                symbol: string
                scores_total: number
                scores: number[]
                scores_by_strategy: number[][]
                id: string
                ipfs: string
                snapshot: string
                space: {
                    id: string
                    name: string
                    symbol: string
                    avatar: string
                }
                state: string
                title: string
                type: string
                network: string
                strategies: Strategy[]
            }
        }
    }

    const { data }: Res = await response.json()
    return data
}

export async function getScores(
    snapshot: string,
    voters: string[],
    network: string,
    space: string,
    strategies: Strategy[],
) {
    const scores: Array<{
        [key in string]: number
    }> = await ss.utils.getScores(space, strategies, network, voters, Number(snapshot), SNAPSHOT_GET_SCORE_API)
    return scores.map((score) =>
        transform(
            score,
            function (
                result: {
                    [key in string]: number
                },
                val,
                key: string,
            ) {
                result[key.toLowerCase()] = val
            },
        ),
    )
}

export async function vote(body: string) {
    const response = await fetch('https://hub.snapshot.org/api/msg', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    })

    const result: VoteSuccess = await response.json()
    return result
}
