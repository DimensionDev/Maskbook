import type { ChainId } from '@masknet/web3-shared-evm'

export interface ProposalIdentifier {
    /**
     * ENS domain name of space.
     * Space is a set of proposals by which specific entity can raise for its purpose.
     * https://docs.snapshot.org/spaces
     */
    space: string
    /** the identifier of proposal */
    id: string
}
export interface RawVote {
    /**
     * There're two sorts of vote,
     * for multiple choice vote, each choice can be assigned to a different weight.
     */
    choice: number | { [choiceIndex: number]: number } | number[]
    created: number
    id: string
    ipfs: string
    voter: string
    vp: number
    vp_by_strategy: number[]
}

export interface Proposal extends Omit<HubProposal, 'votes'> {
    address: string
    authorAvatar?: string
    authorName?: string
    chainId: ChainId
    isEnd: boolean
    isStart: boolean
    msg: string
    status: string
    version: string
    voterAmounts: number // number of voters
    votes: RawVote[]
}

export interface HubProposal {
    author: string
    body: string
    choices: string[]
    created: number
    discussion: string
    end: number
    id: string
    ipfs: string
    network: string
    privacy: string
    scores: number[]
    scores_by_strategy: number[]
    scores_total: number
    snapshot: string
    start: number
    state: string
    strategies: Strategy[]
    symbol: string
    title: string
    type: string
    votes: number
    space: {
        id: string
        name: string
        symbol: string
        avatar: string
    }
}

/**
 * Strategy is the way to calculate voting power.
 * https://docs.snapshot.org/strategies
 */
export interface Strategy {
    name: string
    params: {
        address: string
        decimals?: number
        symbol: string
    }
    network: string
    __typename: string
}

/**
 * Payload of a vote
 */
export interface VoteItem {
    choice: string | undefined
    totalWeight: number | undefined
    choices:
        | Array<{
              index: number
              weight: number
              name: string
          }>
        | undefined
    address: string
    authorIpfsHash: string
    /** the voting power of one voter */
    balance: number
    /** the consist detail of voting power */
    scores: number[]
    strategySymbol: string
    choiceIndex: number | undefined
    choiceIndexes: number[] | undefined
    timestamp: number
}

export interface ProposalResult {
    choice: string
    powerDetail: Array<{
        power: number
        name: string
    }>
    power: number
    percentage: number
}

/**
 * Full-filled response of voting request.
 */
export interface VoteSuccess {
    ipfsHash: string
}

export type VoteResult =
    | {
          ipfsHash: string
      }
    | {
          error: string
          error_description: string
      }

export enum ContentTabs {
    All = 'All',
    Active = 'Active',
    Core = 'Core',
    Pending = 'Pending',
    Closed = 'Closed',
}
