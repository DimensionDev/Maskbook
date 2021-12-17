/// <reference path="./producer.d.ts" />
import fungibleTokenProducer from './producers/fungibleTokenAsset'

// TODO: unit test

export const producers = {
    fungibleTokenAsset: fungibleTokenProducer,
}
