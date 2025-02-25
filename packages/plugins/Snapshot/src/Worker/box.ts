import type { HubProposal, RawVote } from '../types.js'

interface ProposalQueryResult {
    proposal: Proposal
}

// cspell:ignore timelock
interface Proposal {
    id: string
    proposal_id: string
    space: Space
    author: Author
    quorum: number
    execution_hash: string
    metadata: ProposalMetadata
    start: number
    min_end: number
    max_end: number
    snapshot: number
    scores_1: string
    scores_2: string
    scores_3: string
    scores_total: number
    execution_time: number
    execution_strategy: string
    execution_strategy_type: string
    execution_destination: string
    timelock_veto_guardian: string
    strategies_indices: number[]
    strategies: string[]
    strategies_params: string[]
    created: number
    edited: number
    tx: string
    execution_tx: string
    veto_tx: string
    vote_count: number
    execution_ready: boolean
    executed: boolean
    vetoed: boolean
    completed: boolean
    cancelled: boolean
}

interface Space {
    id: string
    controller: string
    authenticators: string[]
    metadata: SpaceMetadata
    strategies_parsed_metadata: StrategyParsedMetadata[]
}

interface SpaceMetadata {
    id: string
    name: string
    avatar: string
    voting_power_symbol: string
    treasuries: string[]
    executors: string[]
    executors_types: string[]
    executors_strategies: ExecutorStrategy[]
}

interface ExecutorStrategy {
    id: string
    address: string
    destination_address: string
    type: string
    treasury_chain: string
    treasury: string
}

interface StrategyParsedMetadata {
    index: number
    data: StrategyData
}

interface StrategyData {
    id: string
    name: string
    description: string
    decimals: number
    symbol: string
    token: string
    payload: any // Consider defining a more specific type if the structure is known
}

interface Author {
    id: string
    address_type: string
}

interface ProposalMetadata {
    id: string
    title: string
    body: string
    discussion: string
    execution: string
    choices: string[]
    labels: string[]
}

export async function fetchProposalFromBoxApi(id: string) {
    const response = await fetch('https://api.snapshot.box/', {
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
                        proposal_id
                        space {
                            id
                            controller
                            authenticators
                            metadata {
                                id
                                name
                                avatar
                                voting_power_symbol
                                treasuries
                                executors
                                executors_types
                                executors_strategies {
                                    id
                                    address
                                    destination_address
                                    type
                                    treasury_chain
                                    treasury
                                }
                            }
                            strategies_parsed_metadata {
                                index
                                data {
                                    id
                                    name
                                    description
                                    decimals
                                    symbol
                                    token
                                    payload
                                }
                            }
                        }
                        author {
                            id
                            address_type
                        }
                        quorum
                        execution_hash
                        metadata {
                            id
                            title
                            body
                            discussion
                            execution
                            choices
                            labels
                        }
                        start
                        min_end
                        max_end
                        snapshot
                        scores_1
                        scores_2
                        scores_3
                        scores_total
                        execution_time
                        execution_strategy
                        execution_strategy_type
                        execution_destination
                        timelock_veto_guardian
                        strategies_indices
                        strategies
                        strategies_params
                        created
                        edited
                        tx
                        execution_tx
                        veto_tx
                        vote_count
                        execution_ready
                        executed
                        vetoed
                        completed
                        cancelled
                    }
                }
            `,
            variables: {
                id,
            },
        }),
    })

    const res: { data: ProposalQueryResult } = await response.json()
    return res.data
}

export function formatBoxProposal(proposal: Proposal): HubProposal {
    return {
        author: proposal.author.id,
        body: proposal.metadata.body,
        choices: proposal.metadata.choices,
        created: proposal.created,
        discussion: proposal.metadata.discussion,
        end: proposal.max_end,
        id: proposal.id,
        ipfs: '',
        network: '',
        privacy: '',
        scores: [],
        scores_by_strategy: [+proposal.scores_1, +proposal.scores_2, +proposal.scores_3],
        scores_total: proposal.scores_total,
        snapshot: proposal.snapshot.toString(),
        start: proposal.start,
        state: '',
        strategies: [],
        symbol: proposal.space.metadata.voting_power_symbol,
        title: proposal.metadata.title,
        type: '',
        votes: proposal.vote_count,
        space: {
            id: proposal.space.id,
            name: proposal.space.metadata.name,
            symbol: proposal.space.metadata.voting_power_symbol,
            avatar: proposal.space.metadata.avatar,
        },
    }
}

/**
 * TypeScript types for the Votes GraphQL query result
 */

// Main response interface
export interface VotesQueryResponse {
    data: {
        votes: Vote[]
    }
}

// Vote interface representing each vote item
export interface Vote {
    id: string
    voter: {
        id: string
    }
    space: {
        id: string
    }
    metadata: {
        reason: string | null
    }
    proposal: number
    choice: number
    /* Voting power */
    vp: string
    /** Unix timestamp */
    created: number
    tx: string
}

export async function fetchVotesFromBox(id: string, first: number, skip: number, space: string) {
    const response = await fetch('https://api.snapshot.box/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'Votes',
            query: /* GraphQL */ `
                query Votes(
                    $first: Int!
                    $skip: Int!
                    $orderBy: Vote_orderBy!
                    $orderDirection: OrderDirection!
                    $where: Vote_filter
                ) {
                    votes(
                        first: $first
                        skip: $skip
                        where: $where
                        orderBy: $orderBy
                        orderDirection: $orderDirection
                    ) {
                        id
                        voter {
                            id
                        }
                        space {
                            id
                        }
                        metadata {
                            reason
                        }
                        proposal
                        choice
                        vp
                        created
                        tx
                    }
                }
            `,
            variables: {
                first,
                skip,
                orderBy: 'vp',
                orderDirection: 'desc',
                where: {
                    proposal: +id,
                    space,
                },
            },
        }),
    })

    const res: VotesQueryResponse = await response.json()
    return res.data
}

export function formatBoxVote(vote: Vote): RawVote {
    return {
        choice: vote.choice,
        created: vote.created,
        id: vote.id,
        ipfs: '',
        voter: vote.voter.id,
        vp: +vote.vp,
        vp_by_strategy: [],
    }
}
