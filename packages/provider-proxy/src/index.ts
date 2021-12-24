/// <reference path="./producer.d.ts" />
import fungibleTokenProducer from './producers/fungibleTokenAsset'
import type { RpcMethodRegistrationValue } from './typs'

// TODO: unit test

export const producers: RpcMethodRegistrationValue[] = [fungibleTokenProducer]
