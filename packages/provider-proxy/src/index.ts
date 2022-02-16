import type { RPCMethodRegistrationValue } from './types'
import fetchProxyVersion from './producers/fetchProxyVersion'
import fungibleTokenProducer from './producers/fungibleTokenAsset'
import nonFungibleCollectionAsset from './producers/nonFungibleCollectionAsset'
import nonFungibleCollectibleAsset from './producers/nonFungibleCollectibleAsset'
import flowNonFungibleCollectibleAsset from './producers/flowNonFungibleCollectibleAsset'

export const producers: RPCMethodRegistrationValue[] = [
    fetchProxyVersion,
    fungibleTokenProducer,
    nonFungibleCollectibleAsset,
    nonFungibleCollectionAsset,
    flowNonFungibleCollectibleAsset,
]
