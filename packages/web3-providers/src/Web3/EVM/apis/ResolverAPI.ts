import {
    PROVIDER_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    CHAIN_DESCRIPTORS,
    type ChainId,
    type SchemaType,
    type NetworkType,
} from '@masknet/web3-shared-evm'
import { Web3StateRef } from './Web3StateAPI.js'
import { ChainResolverAPI_Base } from '../../Base/apis/ChainResolverAPI.js'
import { ExplorerResolverAPI_Base } from '../../Base/apis/ExplorerResolverAPI.js'
import { ProviderResolverAPI_Base } from '../../Base/apis/ProviderResolverAPI.js'
import { NetworkResolverAPI_Base } from '../../Base/apis/NetworkExplorerAPI.js'

export const ChainResolver = new ChainResolverAPI_Base<ChainId, SchemaType, NetworkType>(() => [
    ...CHAIN_DESCRIPTORS,
    ...(Web3StateRef.value.Network?.networks?.getCurrentValue() ?? []),
])
export const ExplorerResolver = new ExplorerResolverAPI_Base<ChainId, SchemaType, NetworkType>(() => [
    ...CHAIN_DESCRIPTORS,
    ...(Web3StateRef.value.Network?.networks?.getCurrentValue() ?? []),
])
export const ProviderResolver = new ProviderResolverAPI_Base(() => PROVIDER_DESCRIPTORS)
export const NetworkResolver = new NetworkResolverAPI_Base(() => NETWORK_DESCRIPTORS)
