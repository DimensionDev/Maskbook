import {
    isValidDomain,
    isValidAddress,
    isNativeTokenAddress,
    type ChainId,
    formatAddress,
    formatDomainName,
    type NetworkType,
    type SchemaType,
    getDefaultChainId,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    formatTokenId,
    isValidChainId,
} from '@masknet/web3-shared-flow'
import { type BaseUtils } from '../../Base/apis/Utils.js'
import { FlowChainResolver, FlowExplorerResolver, FlowNetworkResolver } from './ResolverAPI.js'

export const FlowUtils = {
    chainResolver: FlowChainResolver,
    explorerResolver: FlowExplorerResolver,
    networkResolver: FlowNetworkResolver,

    isValidDomain,
    isValidChainId,
    isValidAddress,
    isNativeTokenAddress,

    getDefaultChainId,
    getNativeTokenAddress,
    getMaskTokenAddress,

    formatAddress,
    formatDomainName,
    formatTokenId,
    formatSchemaType,
} satisfies BaseUtils<ChainId, SchemaType, NetworkType>
