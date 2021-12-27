import type { RPCMethodRegistrationValue } from './types'
import fungibleTokenProducer from './producers/fungibleTokenAsset'
import nonFungibleCollectableAsset from './producers/nonFungibleCollectableAsset'
import nonFungibleCollectionAsset from './producers/nonFungibleCollectionAsset'

// TODO: unit test
export const producers: RPCMethodRegistrationValue[] = [
    fungibleTokenProducer,
    nonFungibleCollectableAsset,
    nonFungibleCollectionAsset,
]
