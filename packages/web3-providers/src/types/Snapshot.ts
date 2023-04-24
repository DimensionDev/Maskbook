import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface SnapshotProposal {
    id: string
    title: string
    body: string
    author: string
    start: number
    end: number
    dateDescription: string
    choices: string[]
    state: string
    scores: number[]
    strategies: Array<{ params: { symbol: string } }>
}

export namespace SnapshotBaseAPI {
    export interface DataSourceProvider {
        get(): Promise<Array<DAOResult<ChainId.Mainnet>>>
    }
    export interface Provider {
        getProposalListBySpace(spaceId: string): Promise<SnapshotProposal[]>
    }
}
