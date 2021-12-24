import fungibleTokenProducer from './producers/fungibleTokenAsset'
import type { RPCMethodRegistrationValue } from './types'
import nonFungibleTokenAsset from './producers/nonFungibleTokenAsset'
import nonFungibleCollectibleAsset from './producers/nonFungibleCollectibleAsset'

// TODO: unit test
export const producers: RPCMethodRegistrationValue[] = [
    fungibleTokenProducer,
    nonFungibleTokenAsset,
    nonFungibleCollectibleAsset,
]
