import fungibleTokenProducer from './producers/fungibleTokenAsset'
import type { RpcMethodRegistrationValue } from './typs'
import nonFungibleTokenAsset from './producers/nonFungibleTokenAsset'
import nonFungibleCollectibleAsset from './producers/nonFungibleCollectibleAsset'

// TODO: unit test
export const producers: RpcMethodRegistrationValue[] = [
    fungibleTokenProducer,
    nonFungibleTokenAsset,
    nonFungibleCollectibleAsset,
]
