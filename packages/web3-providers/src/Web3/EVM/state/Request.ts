import type { RequestArguments } from '@masknet/web3-shared-evm'
import { RequestState } from '../../Base/state/Request.js'
import type { TransferableRequest } from '@masknet/web3-shared-base'

export class Request extends RequestState<RequestArguments> {
    override applyRequest<T>(request: TransferableRequest<RequestArguments>): Promise<T> {
        throw new Error('Method not implemented.')
    }
}
