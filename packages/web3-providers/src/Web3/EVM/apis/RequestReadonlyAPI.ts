import {
    type ChainId,
    ProviderURL,
    type RequestArguments,
    type ProviderType,
    type NetworkType,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import type { ConnectionOptions } from '../types/index.js'
import { createWeb3FromURL } from '../../../helpers/createWeb3FromURL.js'
import { createWeb3ProviderFromURL } from '../../../helpers/createWeb3ProviderFromURL.js'
import type { ConnectionOptionsAPI_Base } from '../../Base/apis/ConnectionOptionsAPI.js'

export class RequestReadonlyAPI {
    static Default = new RequestReadonlyAPI()
    constructor(protected options?: ConnectionOptions) {
        this.ConnectionOptions = new ConnectionOptionsReadonlyAPI(options)
    }
    protected ConnectionOptions: ConnectionOptionsAPI_Base<ChainId, ProviderType, NetworkType, Transaction>

    get request() {
        return async <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            return (await this.getWeb3Provider(initial).request(requestArguments)) as T
        }
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3FromURL(options.providerURL ?? ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3ProviderFromURL(options.providerURL ?? ProviderURL.from(options.chainId))
    }
}
export const RequestReadonly = new RequestReadonlyAPI()
