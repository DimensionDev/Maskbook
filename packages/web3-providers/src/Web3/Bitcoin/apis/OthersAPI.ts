import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidBitcoinAddress,
    isZeroAddress,
    isNativeTokenSchemaType,
    formatBitcoinAddress,
    type ChainId,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    explorerResolver,
    formatSchemaType,
    createNativeToken,
    isValidChainId,
} from '@masknet/web3-shared-bitcoin'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'

export class SolanaOthersAPI extends OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor() {
        super({
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override explorerResolver = explorerResolver

    override isValidDomain = () => false
    override isValidChainId = isValidChainId
    override isValidAddress = isValidBitcoinAddress
    override isZeroAddress = isZeroAddress
    override isNativeTokenAddress = isZeroAddress

    override isNativeTokenSchemaType = isNativeTokenSchemaType
    override isFungibleTokenSchemaType = isNativeTokenSchemaType
    override isNonFungibleTokenSchemaType = (scheamType: SchemaType) => !isNativeTokenSchemaType(scheamType)

    override getNetworkPluginID = getNetworkPluginID
    override getDefaultChainId = getDefaultChainId
    override getInvalidChainId = getInvalidChainId
    override getDefaultNetworkType = getDefaultNetworkType
    override getDefaultProviderType = getDefaultProviderType
    override getZeroAddress = getZeroAddress
    override getMaskTokenAddress = () => ''
    override getNativeTokenAddress = getZeroAddress

    override formatAddress = formatBitcoinAddress
    override formatDomainName = formatDomainName
    override formatTokenId = () => ''
    override formatSchemaType = formatSchemaType
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
