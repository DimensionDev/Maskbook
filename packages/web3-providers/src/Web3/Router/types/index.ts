import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import type { ConnectionOptions_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'
import type { HubAPI_Base } from '../../Base/apis/HubAPI.js'

export interface ConnectionOptions<T extends NetworkPluginID>
    extends ConnectionOptions_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Transaction']
    > {}

export interface HubOptions<T extends NetworkPluginID> extends HubOptions_Base<Web3Helper.Definition[T]['ChainId']> {}

export interface Connection<T extends NetworkPluginID>
    extends ConnectionAPI_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['AddressType'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Signature'],
        Web3Helper.Definition[T]['Operation'],
        Web3Helper.Definition[T]['Transaction'],
        Web3Helper.Definition[T]['TransactionReceipt'],
        Web3Helper.Definition[T]['TransactionDetailed'],
        Web3Helper.Definition[T]['TransactionSignature'],
        Web3Helper.Definition[T]['Block'],
        Web3Helper.Definition[T]['Web3'],
        Web3Helper.Definition[T]['Web3Provider']
    > {}

export interface Hub<T extends NetworkPluginID>
    extends HubAPI_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['NetworkType'],
        Web3Helper.Definition[T]['Transaction'],
        Web3Helper.Definition[T]['TransactionParameter'],
        Web3Helper.Definition[T]['GasOption']
    > {}

export interface Others<T extends NetworkPluginID>
    extends OthersAPI_Base<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['NetworkType'],
        Web3Helper.Definition[T]['Transaction']
    > {}
