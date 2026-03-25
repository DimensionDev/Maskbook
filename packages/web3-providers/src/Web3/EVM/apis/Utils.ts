import {
    isValidDomain,
    isValidAddress,
    isNativeTokenAddress,
    formatEthereumAddress,
    formatDomainName,
    formatTokenId,
    type ChainId,
    type NetworkType,
    type SchemaType,
    getDefaultChainId,
    getMaskTokenAddress,
    getNativeTokenAddress,
    getAverageBlockDelay,
    formatSchemaType,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import type { BaseUtils } from '../../Base/apis/Utils.js'
import { EVMChainResolver, EVMExplorerResolver, EVMNetworkResolver } from './ResolverAPI.js'

export const EVMUtils = {
    chainResolver: EVMChainResolver,
    explorerResolver: EVMExplorerResolver,
    networkResolver: EVMNetworkResolver,

    isValidDomain,
    isValidChainId,
    isValidAddress,
    isNativeTokenAddress,

    getDefaultChainId,
    getMaskTokenAddress,
    getNativeTokenAddress,
    getAverageBlockDelay,

    formatAddress: formatEthereumAddress,
    formatTokenId,
    formatDomainName,
    formatSchemaType,
} satisfies BaseUtils<ChainId, SchemaType, NetworkType>
