import type {
    ChainId,
    GasOption,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-solana'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'

export class SolanaHubBaseAPI extends HubBaseAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
    GasOption
> {
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)
}
