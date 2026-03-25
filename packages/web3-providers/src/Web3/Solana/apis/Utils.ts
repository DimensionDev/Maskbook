import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isNativeTokenAddress,
    type ChainId,
    type NetworkType,
    type SchemaType,
    formatAddress,
    formatTokenId,
    getDefaultChainId,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { type BaseUtils } from '../../Base/apis/Utils.js'
import { SolanaChainResolver, SolanaExplorerResolver, SolanaNetworkResolver } from './ResolverAPI.js'

export const SolanaUtils = {
    chainResolver: SolanaChainResolver,
    explorerResolver: SolanaExplorerResolver,
    networkResolver: SolanaNetworkResolver,

    isValidDomain,
    isValidChainId,
    isValidAddress,
    isNativeTokenAddress,

    getDefaultChainId,
    getMaskTokenAddress,
    getNativeTokenAddress,

    formatAddress,
    formatDomainName,
    formatTokenId,
    formatSchemaType,
} satisfies BaseUtils<ChainId, SchemaType, NetworkType>
