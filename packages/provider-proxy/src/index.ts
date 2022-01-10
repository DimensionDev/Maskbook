import type { RPCMethodRegistrationValue } from './types'
import fungibleTokenProducer from './producers/fungibleTokenAsset'
import nonFungibleCollectionAsset from './producers/nonFungibleCollectionAsset'
import nonFungibleCollectibleAsset from './producers/nonFungibleCollectibleAsset'

export const producers: RPCMethodRegistrationValue[] = [
    fungibleTokenProducer,
    nonFungibleCollectibleAsset,
    nonFungibleCollectionAsset,
]
