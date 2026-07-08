import {
    type ChainId,
    ProviderURL,
    type RequestArguments,
    type ProviderType,
    type NetworkType,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createWeb3ProviderFromURL } from '../../../helpers/createWeb3ProviderFromURL.js'
import type { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import { createViemClientFromURL } from '../../../helpers/createViemClient.js'

export class EVMRequestReadonlyAPI {
    static Default = new EVMRequestReadonlyAPI()

    constructor(protected options?: EVMConnectionOptions) {
        this.ConnectionOptions = new ConnectionOptionsReadonlyAPI(options)
    }

    protected ConnectionOptions: ConnectionOptionsProvider<ChainId, ProviderType, NetworkType, Transaction>

    get request() {
        return async <T>(requestArguments: RequestArguments, initial?: EVMConnectionOptions) => {
            return (await this.getWeb3Provider(initial).request(requestArguments)) as T
        }
    }

    getViem(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createViemClientFromURL(options.chainId, options.providerURL ?? ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3ProviderFromURL(options.providerURL ?? ProviderURL.from(options.chainId))
    }
}

export const EVMRequestReadonly = new EVMRequestReadonlyAPI()
