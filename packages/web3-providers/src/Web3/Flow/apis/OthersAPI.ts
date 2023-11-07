import { createFungibleToken, createNonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    type ChainId,
    formatAddress,
    formatDomainName,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    formatTokenId,
    isValidChainId,
    getNetworkPluginID,
} from '@masknet/web3-shared-flow'
import { type OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import { FlowChainResolver, FlowExplorerResolver, FlowProviderResolver, FlowNetworkResolver } from './ResolverAPI.js'

export const FlowOthersAPI = {
    isSameAddress,
    chainResolver: FlowChainResolver,
    explorerResolver: FlowExplorerResolver,
    providerResolver: FlowProviderResolver,
    networkResolver: FlowNetworkResolver,

    isValidDomain,
    isValidChainId,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,

    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getNativeTokenAddress,
    getMaskTokenAddress,

    formatAddress,
    formatDomainName,
    formatTokenId,
    formatSchemaType,
    createNativeToken(chainId: ChainId) {
        return FlowChainResolver.nativeCurrency(chainId)
    },
    createFungibleToken,
    createNonFungibleToken,
} satisfies OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
