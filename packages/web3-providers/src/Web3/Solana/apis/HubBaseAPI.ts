import type { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-solana'
import { SolanaHubOptionsAPI } from './HubOptionsAPI.js'
import { BaseHubProvider } from '../../Base/apis/HubBase.js'

export class SolanaBaseHub extends BaseHubProvider<ChainId, SchemaType, GasOption> {
    override getGasOptions = undefined
    override getGasLimit = undefined
    override getTransactions = undefined
    protected override HubOptions = new SolanaHubOptionsAPI(this.options)
}
