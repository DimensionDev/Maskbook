/// <reference path="./producer.d.ts" />
import fungibleTokenProducer from './producers/fungibleTokenAsset'

// TODO: unit test

const producers = {
    fungibleTokenAsset: fungibleTokenProducer,
}

export default producers
