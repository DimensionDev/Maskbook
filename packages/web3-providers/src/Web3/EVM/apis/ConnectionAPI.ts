import type Web3 from 'web3'
import {
    AddressType,
    SchemaType,
    type ChainId,
    type Web3Provider,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type TransactionSignature,
    type ProviderType,
    type Signature,
    type UserOperation,
} from '@masknet/web3-shared-evm'
import { RequestAPI } from './RequestAPI.js'
import { ContractAPI } from './ContractAPI.js'
import { ConnectionReadonlyAPI } from './ConnectionReadonlyAPI.js'
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'

export class ConnectionAPI
    extends ConnectionReadonlyAPI
    implements
        ConnectionAPI_Base<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            UserOperation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3,
            Web3Provider
        >
{
    protected override Request = new RequestAPI(this.options)
    protected override Contract = new ContractAPI(this.options)
}
