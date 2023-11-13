import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    type ChainId,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    formatAddress,
    formatTokenId,
    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { createFungibleToken, createNonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import { type BaseUtils } from '../../Base/apis/Utils.js'
import {
    SolanaChainResolver,
    SolanaExplorerResolver,
    SolanaProviderResolver,
    SolanaNetworkResolver,
} from './ResolverAPI.js'

export const SolanaUtils = {
    isSameAddress,
    chainResolver: SolanaChainResolver,
    explorerResolver: SolanaExplorerResolver,
    providerResolver: SolanaProviderResolver,
    networkResolver: SolanaNetworkResolver,

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
    getMaskTokenAddress,
    getNativeTokenAddress,

    formatAddress,
    formatDomainName,
    formatTokenId,
    formatSchemaType,
    createNativeToken(chainId: ChainId) {
        return SolanaChainResolver.nativeCurrency(chainId)
    },
    createFungibleToken,
    createNonFungibleToken,
} satisfies BaseUtils<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
