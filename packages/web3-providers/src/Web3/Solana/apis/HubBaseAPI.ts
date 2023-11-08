import type { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-solana'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { HubBaseAPI_Base } from '../../Base/apis/HubBaseAPI.js'

export class SolanaHubBaseAPI extends HubBaseAPI_Base<ChainId, SchemaType, GasOption> {
    override getGasOptions = undefined
    override getTransactions = undefined
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)
}
