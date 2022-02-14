import type { RPCMethodRegistrationValue } from './types'
import fungibleTokenProducer from './producers/fungibleTokenAsset'
import nonFungibleCollectionAsset from './producers/nonFungibleCollectionAsset'
import nonFungibleCollectibleAsset from './producers/nonFungibleCollectibleAsset'
import nonFungibleCollectibleAssetV2 from './producers/nonFungibleCollectibleAssetV2'

export const producers: RPCMethodRegistrationValue[] = [
    fungibleTokenProducer,
    nonFungibleCollectibleAsset,
    nonFungibleCollectibleAssetV2,
    nonFungibleCollectionAsset,
]
