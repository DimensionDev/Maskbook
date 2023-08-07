import { attemptUntil } from '@masknet/web3-shared-base'
import {
    type ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import { BitcoinHubOptionsAPI } from './HubOptionsAPI.js'
import { BitcoinConnectionAPI } from './ConnectionAPI.js'
import type { HubOptions } from '../types/index.js'

export class BitcoinHubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private Web3 = new BitcoinConnectionAPI()

    protected override HubOptions = new BitcoinHubOptionsAPI(this.options)

    override getFungibleToken(address: string, initial?: HubOptions | undefined) {
        return attemptUntil([() => this.Web3.getFungibleToken(address, initial)], undefined)
    }
}
