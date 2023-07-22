import type { Subscription } from 'use-subscription'
import type {
    ReasonableRequest,
    TransferableRequest,
    RequestState as Web3RequestState,
} from '@masknet/web3-shared-base'

export class RequestState<Arguments> implements Web3RequestState<Arguments> {
    requests?: Subscription<Array<ReasonableRequest<Arguments>>> | undefined

    ready: boolean = true
    readyPromise: Promise<void> = Promise.resolve()

    applyRequest<T>(request: TransferableRequest<Arguments>): Promise<T> {
        throw new Error('Method not implemented.')
    }
    updateRequest(id: string, updates: Partial<TransferableRequest<Arguments>>): Promise<void> {
        throw new Error('Method not implemented.')
    }
    approveRequest(id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    denyRequest(id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    denyAllRequests(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
