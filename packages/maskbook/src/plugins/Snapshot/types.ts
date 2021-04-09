import type snapshot from '@snapshot-labs/snapshot.js'

export interface ProposalIdentifier {
    id: string
    space: string
}

export interface Proposal {
    address: string
    msg: string
    sig: string
    version: string
}

export interface Strategy {
    name: keyof typeof snapshot.strategies
    params: {
        address: string
        decimals?: number
        symbol: string
    }
}

export interface ProposalPayload {
    body: string
    choices: string[]
    start: number
    end: number
    snapshot: string
    name: string
    metadata: {
        strategies: Strategy[]
    }
}

export interface ProposalMessage {
    payload: ProposalPayload
    timestamp: string
    token: string
    type: 'proposal'
    version: string
    space: string
}

export interface Vote {
    address: string
    authorIpfsHash: string
    relayerIpfsHash: string
    balance: number
    scores: number[]
    sig: string
    msg: {
        payload: {
            choice: number
            metadata: {}
            proposal: string
        }
        space: string
        timestamp: string
        type: 'vote'
        version: string
    }
}

export type Votes = {
    [key in string]: Vote
}

export interface ProposalResult {
    choice: string
    voteNumber: number
    powerDetail: number[]
    power: number
    percentage: number
}
