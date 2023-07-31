import type {
    ChainId,
    GasOption,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { BitcoinHubOptionsAPI } from './HubOptionsAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'

export class BitcoinHubBaseAPI extends HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
    GasOption
> {
    protected override HubOptions = new BitcoinHubOptionsAPI(this.options)
}
