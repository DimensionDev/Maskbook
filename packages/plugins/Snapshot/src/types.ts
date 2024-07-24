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
interface RawVote {
    /**
     * There're two sorts of vote,
     * for multiple choice vote, each choice can be assigned to a different weight.
     */
    choice: number | { [choiceIndex: number]: number } | number[]
    created: number
    voter: string
    ipfs: string
    id: string
    vp: number
    vp_by_strategy: number[]
}

export interface Proposal {
    address: string
    author: string
    // forum link
    discussion: string
    // number of voters
    voterAmounts: number
    symbol: string
    scores_total: number
    scores: number[]
    scores_by_strategy: number[][]
    msg: string
    title: string
    version: string
    end: number
    ipfs: string
    space: {
        id: string
        name: string
        symbol: string
        avatar: string
    }
    start: number
    snapshot: string
    body: string
    choices: string[]
    isStart: boolean
    isEnd: boolean
    status: string
    strategies: Strategy[]
    authorName?: string
    authorAvatar?: string
    chainId: ChainId
    network: string
    type: string
    votes: RawVote[]
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

export enum ContentTabs {
    All = 'All',
    Active = 'Active',
    Core = 'Core',
    Pending = 'Pending',
    Closed = 'Closed',
}
