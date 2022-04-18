import { GraphQLClient } from 'graphql-request'
import * as Dom from 'graphql-request/dist/types.dom'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
    Float: number
    BigDecimal: string
    BigInt: string
    Bytes: string
}

export type Activity = {
    __typename?: 'Activity'
    createdAt: Scalars['BigInt']
    id: Scalars['ID']
    realm: Realm
    type: Scalars['String']
}

export type Activity_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    type?: InputMaybe<Scalars['String']>
    type_contains?: InputMaybe<Scalars['String']>
    type_contains_nocase?: InputMaybe<Scalars['String']>
    type_ends_with?: InputMaybe<Scalars['String']>
    type_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_gt?: InputMaybe<Scalars['String']>
    type_gte?: InputMaybe<Scalars['String']>
    type_in?: InputMaybe<Array<Scalars['String']>>
    type_lt?: InputMaybe<Scalars['String']>
    type_lte?: InputMaybe<Scalars['String']>
    type_not?: InputMaybe<Scalars['String']>
    type_not_contains?: InputMaybe<Scalars['String']>
    type_not_contains_nocase?: InputMaybe<Scalars['String']>
    type_not_ends_with?: InputMaybe<Scalars['String']>
    type_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_not_in?: InputMaybe<Array<Scalars['String']>>
    type_not_starts_with?: InputMaybe<Scalars['String']>
    type_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    type_starts_with?: InputMaybe<Scalars['String']>
    type_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Activity_OrderBy {
    createdAt = 'createdAt',
    id = 'id',
    realm = 'realm',
    type = 'type',
}

export type Aquarium = {
    __typename?: 'Aquarium'
    aquariumId: Scalars['BigInt']
    createdAt: Scalars['BigInt']
    id: Scalars['ID']
    realm: Realm
}

export type Aquarium_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    aquariumId?: InputMaybe<Scalars['BigInt']>
    aquariumId_gt?: InputMaybe<Scalars['BigInt']>
    aquariumId_gte?: InputMaybe<Scalars['BigInt']>
    aquariumId_in?: InputMaybe<Array<Scalars['BigInt']>>
    aquariumId_lt?: InputMaybe<Scalars['BigInt']>
    aquariumId_lte?: InputMaybe<Scalars['BigInt']>
    aquariumId_not?: InputMaybe<Scalars['BigInt']>
    aquariumId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Aquarium_OrderBy {
    aquariumId = 'aquariumId',
    createdAt = 'createdAt',
    id = 'id',
    realm = 'realm',
}

export type BlockChangedFilter = {
    number_gte: Scalars['Int']
}

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>
    number?: InputMaybe<Scalars['Int']>
    number_gte?: InputMaybe<Scalars['Int']>
}

export type BuildQueue = {
    __typename?: 'BuildQueue'
    id: Scalars['ID']
    limit: Scalars['BigInt']
    realm: Realm
}

export type BuildQueueSlot = {
    __typename?: 'BuildQueueSlot'
    id: Scalars['ID']
    queueTimeEnds: Scalars['BigInt']
    realm: Realm
    slot: Scalars['BigInt']
}

export type BuildQueueSlot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    queueTimeEnds?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_gt?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_gte?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_in?: InputMaybe<Array<Scalars['BigInt']>>
    queueTimeEnds_lt?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_lte?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_not?: InputMaybe<Scalars['BigInt']>
    queueTimeEnds_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    slot?: InputMaybe<Scalars['BigInt']>
    slot_gt?: InputMaybe<Scalars['BigInt']>
    slot_gte?: InputMaybe<Scalars['BigInt']>
    slot_in?: InputMaybe<Array<Scalars['BigInt']>>
    slot_lt?: InputMaybe<Scalars['BigInt']>
    slot_lte?: InputMaybe<Scalars['BigInt']>
    slot_not?: InputMaybe<Scalars['BigInt']>
    slot_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum BuildQueueSlot_OrderBy {
    id = 'id',
    queueTimeEnds = 'queueTimeEnds',
    realm = 'realm',
    slot = 'slot',
}

export type BuildQueue_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    limit?: InputMaybe<Scalars['BigInt']>
    limit_gt?: InputMaybe<Scalars['BigInt']>
    limit_gte?: InputMaybe<Scalars['BigInt']>
    limit_in?: InputMaybe<Array<Scalars['BigInt']>>
    limit_lt?: InputMaybe<Scalars['BigInt']>
    limit_lte?: InputMaybe<Scalars['BigInt']>
    limit_not?: InputMaybe<Scalars['BigInt']>
    limit_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum BuildQueue_OrderBy {
    id = 'id',
    limit = 'limit',
    realm = 'realm',
}

export type City = {
    __typename?: 'City'
    cityId: Scalars['BigInt']
    createdAt: Scalars['BigInt']
    culture: Scalars['BigInt']
    gold: Scalars['BigInt']
    id: Scalars['ID']
    realm: Realm
    religion: Scalars['BigInt']
    technology: Scalars['BigInt']
    workforce: Scalars['BigInt']
}

export type City_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    cityId?: InputMaybe<Scalars['BigInt']>
    cityId_gt?: InputMaybe<Scalars['BigInt']>
    cityId_gte?: InputMaybe<Scalars['BigInt']>
    cityId_in?: InputMaybe<Array<Scalars['BigInt']>>
    cityId_lt?: InputMaybe<Scalars['BigInt']>
    cityId_lte?: InputMaybe<Scalars['BigInt']>
    cityId_not?: InputMaybe<Scalars['BigInt']>
    cityId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    culture?: InputMaybe<Scalars['BigInt']>
    culture_gt?: InputMaybe<Scalars['BigInt']>
    culture_gte?: InputMaybe<Scalars['BigInt']>
    culture_in?: InputMaybe<Array<Scalars['BigInt']>>
    culture_lt?: InputMaybe<Scalars['BigInt']>
    culture_lte?: InputMaybe<Scalars['BigInt']>
    culture_not?: InputMaybe<Scalars['BigInt']>
    culture_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    gold?: InputMaybe<Scalars['BigInt']>
    gold_gt?: InputMaybe<Scalars['BigInt']>
    gold_gte?: InputMaybe<Scalars['BigInt']>
    gold_in?: InputMaybe<Array<Scalars['BigInt']>>
    gold_lt?: InputMaybe<Scalars['BigInt']>
    gold_lte?: InputMaybe<Scalars['BigInt']>
    gold_not?: InputMaybe<Scalars['BigInt']>
    gold_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    religion?: InputMaybe<Scalars['BigInt']>
    religion_gt?: InputMaybe<Scalars['BigInt']>
    religion_gte?: InputMaybe<Scalars['BigInt']>
    religion_in?: InputMaybe<Array<Scalars['BigInt']>>
    religion_lt?: InputMaybe<Scalars['BigInt']>
    religion_lte?: InputMaybe<Scalars['BigInt']>
    religion_not?: InputMaybe<Scalars['BigInt']>
    religion_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    technology?: InputMaybe<Scalars['BigInt']>
    technology_gt?: InputMaybe<Scalars['BigInt']>
    technology_gte?: InputMaybe<Scalars['BigInt']>
    technology_in?: InputMaybe<Array<Scalars['BigInt']>>
    technology_lt?: InputMaybe<Scalars['BigInt']>
    technology_lte?: InputMaybe<Scalars['BigInt']>
    technology_not?: InputMaybe<Scalars['BigInt']>
    technology_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    workforce?: InputMaybe<Scalars['BigInt']>
    workforce_gt?: InputMaybe<Scalars['BigInt']>
    workforce_gte?: InputMaybe<Scalars['BigInt']>
    workforce_in?: InputMaybe<Array<Scalars['BigInt']>>
    workforce_lt?: InputMaybe<Scalars['BigInt']>
    workforce_lte?: InputMaybe<Scalars['BigInt']>
    workforce_not?: InputMaybe<Scalars['BigInt']>
    workforce_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum City_OrderBy {
    cityId = 'cityId',
    createdAt = 'createdAt',
    culture = 'culture',
    gold = 'gold',
    id = 'id',
    realm = 'realm',
    religion = 'religion',
    technology = 'technology',
    workforce = 'workforce',
}

export type Collect = {
    __typename?: 'Collect'
    amount: Scalars['BigInt']
    createdAt: Scalars['BigInt']
    id: Scalars['ID']
    name: Scalars['String']
    realm: Realm
    type: Scalars['BigInt']
}

export type Collect_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    amount?: InputMaybe<Scalars['BigInt']>
    amount_gt?: InputMaybe<Scalars['BigInt']>
    amount_gte?: InputMaybe<Scalars['BigInt']>
    amount_in?: InputMaybe<Array<Scalars['BigInt']>>
    amount_lt?: InputMaybe<Scalars['BigInt']>
    amount_lte?: InputMaybe<Scalars['BigInt']>
    amount_not?: InputMaybe<Scalars['BigInt']>
    amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    type?: InputMaybe<Scalars['BigInt']>
    type_gt?: InputMaybe<Scalars['BigInt']>
    type_gte?: InputMaybe<Scalars['BigInt']>
    type_in?: InputMaybe<Array<Scalars['BigInt']>>
    type_lt?: InputMaybe<Scalars['BigInt']>
    type_lte?: InputMaybe<Scalars['BigInt']>
    type_not?: InputMaybe<Scalars['BigInt']>
    type_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Collect_OrderBy {
    amount = 'amount',
    createdAt = 'createdAt',
    id = 'id',
    name = 'name',
    realm = 'realm',
    type = 'type',
}

export type Farm = {
    __typename?: 'Farm'
    createdAt: Scalars['BigInt']
    farmId: Scalars['BigInt']
    id: Scalars['ID']
    realm: Realm
}

export type Farm_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    farmId?: InputMaybe<Scalars['BigInt']>
    farmId_gt?: InputMaybe<Scalars['BigInt']>
    farmId_gte?: InputMaybe<Scalars['BigInt']>
    farmId_in?: InputMaybe<Array<Scalars['BigInt']>>
    farmId_lt?: InputMaybe<Scalars['BigInt']>
    farmId_lte?: InputMaybe<Scalars['BigInt']>
    farmId_not?: InputMaybe<Scalars['BigInt']>
    farmId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Farm_OrderBy {
    createdAt = 'createdAt',
    farmId = 'farmId',
    id = 'id',
    realm = 'realm',
}

export type Metric = {
    __typename?: 'Metric'
    id: Scalars['ID']
    name: Scalars['String']
    realm: Realm
    totalAdded: Scalars['BigInt']
    totalAmount: Scalars['BigInt']
    type: Scalars['BigInt']
}

export type Metric_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalAdded?: InputMaybe<Scalars['BigInt']>
    totalAdded_gt?: InputMaybe<Scalars['BigInt']>
    totalAdded_gte?: InputMaybe<Scalars['BigInt']>
    totalAdded_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAdded_lt?: InputMaybe<Scalars['BigInt']>
    totalAdded_lte?: InputMaybe<Scalars['BigInt']>
    totalAdded_not?: InputMaybe<Scalars['BigInt']>
    totalAdded_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAmount?: InputMaybe<Scalars['BigInt']>
    totalAmount_gt?: InputMaybe<Scalars['BigInt']>
    totalAmount_gte?: InputMaybe<Scalars['BigInt']>
    totalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAmount_lt?: InputMaybe<Scalars['BigInt']>
    totalAmount_lte?: InputMaybe<Scalars['BigInt']>
    totalAmount_not?: InputMaybe<Scalars['BigInt']>
    totalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    type?: InputMaybe<Scalars['BigInt']>
    type_gt?: InputMaybe<Scalars['BigInt']>
    type_gte?: InputMaybe<Scalars['BigInt']>
    type_in?: InputMaybe<Array<Scalars['BigInt']>>
    type_lt?: InputMaybe<Scalars['BigInt']>
    type_lte?: InputMaybe<Scalars['BigInt']>
    type_not?: InputMaybe<Scalars['BigInt']>
    type_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Metric_OrderBy {
    id = 'id',
    name = 'name',
    realm = 'realm',
    totalAdded = 'totalAdded',
    totalAmount = 'totalAmount',
    type = 'type',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    asc = 'asc',
    desc = 'desc',
}

export type Owner = {
    __typename?: 'Owner'
    id: Scalars['ID']
    operators: Array<Scalars['Bytes']>
    owner: Scalars['Bytes']
}

export type Owner_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    operators?: InputMaybe<Array<Scalars['Bytes']>>
    operators_contains?: InputMaybe<Array<Scalars['Bytes']>>
    operators_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
    operators_not?: InputMaybe<Array<Scalars['Bytes']>>
    operators_not_contains?: InputMaybe<Array<Scalars['Bytes']>>
    operators_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
    owner?: InputMaybe<Scalars['Bytes']>
    owner_contains?: InputMaybe<Scalars['Bytes']>
    owner_in?: InputMaybe<Array<Scalars['Bytes']>>
    owner_not?: InputMaybe<Scalars['Bytes']>
    owner_not_contains?: InputMaybe<Scalars['Bytes']>
    owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum Owner_OrderBy {
    id = 'id',
    operators = 'operators',
    owner = 'owner',
}

export type Query = {
    __typename?: 'Query'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    activities: Array<Activity>
    activity?: Maybe<Activity>
    aquarium?: Maybe<Aquarium>
    aquariums: Array<Aquarium>
    buildQueue?: Maybe<BuildQueue>
    buildQueueSlot?: Maybe<BuildQueueSlot>
    buildQueueSlots: Array<BuildQueueSlot>
    buildQueues: Array<BuildQueue>
    cities: Array<City>
    city?: Maybe<City>
    collect?: Maybe<Collect>
    collects: Array<Collect>
    farm?: Maybe<Farm>
    farms: Array<Farm>
    metric?: Maybe<Metric>
    metrics: Array<Metric>
    owner?: Maybe<Owner>
    owners: Array<Owner>
    realm?: Maybe<Realm>
    realmId?: Maybe<RealmId>
    realmIds: Array<RealmId>
    realms: Array<Realm>
    researchLab?: Maybe<ResearchLab>
    researchLabs: Array<ResearchLab>
    resource?: Maybe<Resource>
    resources: Array<Resource>
    stat?: Maybe<Stat>
    stats: Array<Stat>
    supplies: Array<Supply>
    supply?: Maybe<Supply>
    totalResource?: Maybe<TotalResource>
    totalResources: Array<TotalResource>
    totalStructure?: Maybe<TotalStructure>
    totalStructures: Array<TotalStructure>
}

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>
}

export type QueryActivitiesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Activity_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Activity_Filter>
}

export type QueryActivityArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAquariumArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAquariumsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Aquarium_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Aquarium_Filter>
}

export type QueryBuildQueueArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryBuildQueueSlotArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryBuildQueueSlotsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueueSlot_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<BuildQueueSlot_Filter>
}

export type QueryBuildQueuesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueue_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<BuildQueue_Filter>
}

export type QueryCitiesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<City_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<City_Filter>
}

export type QueryCityArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCollectArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCollectsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Collect_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Collect_Filter>
}

export type QueryFarmArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryFarmsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Farm_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Farm_Filter>
}

export type QueryMetricArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryMetricsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Metric_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Metric_Filter>
}

export type QueryOwnerArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryOwnersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Owner_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Owner_Filter>
}

export type QueryRealmArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryRealmIdArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryRealmIdsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<RealmId_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<RealmId_Filter>
}

export type QueryRealmsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Realm_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Realm_Filter>
}

export type QueryResearchLabArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryResearchLabsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<ResearchLab_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<ResearchLab_Filter>
}

export type QueryResourceArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryResourcesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Resource_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Resource_Filter>
}

export type QueryStatArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryStatsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Stat_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Stat_Filter>
}

export type QuerySuppliesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Supply_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Supply_Filter>
}

export type QuerySupplyArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTotalResourceArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTotalResourcesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<TotalResource_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<TotalResource_Filter>
}

export type QueryTotalStructureArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTotalStructuresArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<TotalStructure_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<TotalStructure_Filter>
}

export type Realm = {
    __typename?: 'Realm'
    buildQueueSlot: Array<BuildQueueSlot>
    buildQueues: Array<BuildQueue>
    cities: Array<City>
    cityBuildTime: Scalars['BigInt']
    collectTime: Scalars['BigInt']
    createdAt: Scalars['BigInt']
    feature1: Scalars['String']
    feature2: Scalars['String']
    feature3: Scalars['String']
    id: Scalars['ID']
    lastCollectedAt: Scalars['BigInt']
    lastStakedAt: Scalars['BigInt']
    metrics: Array<Metric>
    name: Scalars['String']
    owner: Scalars['Bytes']
    partner: Scalars['Boolean']
    realmId: Scalars['String']
    realmIdNum: Scalars['Int']
    resourceId: Scalars['BigInt']
    size: Scalars['BigInt']
    staked: Scalars['Boolean']
    stakedBy: Scalars['Bytes']
    supplies: Array<Supply>
    terraformedAt: Scalars['BigInt']
    totalStructures: Array<TotalStructure>
}

export type RealmBuildQueueSlotArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueueSlot_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<BuildQueueSlot_Filter>
}

export type RealmBuildQueuesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueue_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<BuildQueue_Filter>
}

export type RealmCitiesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<City_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<City_Filter>
}

export type RealmMetricsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Metric_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Metric_Filter>
}

export type RealmSuppliesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Supply_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Supply_Filter>
}

export type RealmTotalStructuresArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<TotalStructure_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<TotalStructure_Filter>
}

export type RealmId = {
    __typename?: 'RealmId'
    id: Scalars['ID']
    ids: Array<Scalars['String']>
}

export type RealmId_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    ids?: InputMaybe<Array<Scalars['String']>>
    ids_contains?: InputMaybe<Array<Scalars['String']>>
    ids_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    ids_not?: InputMaybe<Array<Scalars['String']>>
    ids_not_contains?: InputMaybe<Array<Scalars['String']>>
    ids_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
}

export enum RealmId_OrderBy {
    id = 'id',
    ids = 'ids',
}

export type Realm_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    cityBuildTime?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_gt?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_gte?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_in?: InputMaybe<Array<Scalars['BigInt']>>
    cityBuildTime_lt?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_lte?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_not?: InputMaybe<Scalars['BigInt']>
    cityBuildTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    collectTime?: InputMaybe<Scalars['BigInt']>
    collectTime_gt?: InputMaybe<Scalars['BigInt']>
    collectTime_gte?: InputMaybe<Scalars['BigInt']>
    collectTime_in?: InputMaybe<Array<Scalars['BigInt']>>
    collectTime_lt?: InputMaybe<Scalars['BigInt']>
    collectTime_lte?: InputMaybe<Scalars['BigInt']>
    collectTime_not?: InputMaybe<Scalars['BigInt']>
    collectTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    feature1?: InputMaybe<Scalars['String']>
    feature1_contains?: InputMaybe<Scalars['String']>
    feature1_contains_nocase?: InputMaybe<Scalars['String']>
    feature1_ends_with?: InputMaybe<Scalars['String']>
    feature1_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature1_gt?: InputMaybe<Scalars['String']>
    feature1_gte?: InputMaybe<Scalars['String']>
    feature1_in?: InputMaybe<Array<Scalars['String']>>
    feature1_lt?: InputMaybe<Scalars['String']>
    feature1_lte?: InputMaybe<Scalars['String']>
    feature1_not?: InputMaybe<Scalars['String']>
    feature1_not_contains?: InputMaybe<Scalars['String']>
    feature1_not_contains_nocase?: InputMaybe<Scalars['String']>
    feature1_not_ends_with?: InputMaybe<Scalars['String']>
    feature1_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature1_not_in?: InputMaybe<Array<Scalars['String']>>
    feature1_not_starts_with?: InputMaybe<Scalars['String']>
    feature1_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    feature1_starts_with?: InputMaybe<Scalars['String']>
    feature1_starts_with_nocase?: InputMaybe<Scalars['String']>
    feature2?: InputMaybe<Scalars['String']>
    feature2_contains?: InputMaybe<Scalars['String']>
    feature2_contains_nocase?: InputMaybe<Scalars['String']>
    feature2_ends_with?: InputMaybe<Scalars['String']>
    feature2_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature2_gt?: InputMaybe<Scalars['String']>
    feature2_gte?: InputMaybe<Scalars['String']>
    feature2_in?: InputMaybe<Array<Scalars['String']>>
    feature2_lt?: InputMaybe<Scalars['String']>
    feature2_lte?: InputMaybe<Scalars['String']>
    feature2_not?: InputMaybe<Scalars['String']>
    feature2_not_contains?: InputMaybe<Scalars['String']>
    feature2_not_contains_nocase?: InputMaybe<Scalars['String']>
    feature2_not_ends_with?: InputMaybe<Scalars['String']>
    feature2_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature2_not_in?: InputMaybe<Array<Scalars['String']>>
    feature2_not_starts_with?: InputMaybe<Scalars['String']>
    feature2_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    feature2_starts_with?: InputMaybe<Scalars['String']>
    feature2_starts_with_nocase?: InputMaybe<Scalars['String']>
    feature3?: InputMaybe<Scalars['String']>
    feature3_contains?: InputMaybe<Scalars['String']>
    feature3_contains_nocase?: InputMaybe<Scalars['String']>
    feature3_ends_with?: InputMaybe<Scalars['String']>
    feature3_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature3_gt?: InputMaybe<Scalars['String']>
    feature3_gte?: InputMaybe<Scalars['String']>
    feature3_in?: InputMaybe<Array<Scalars['String']>>
    feature3_lt?: InputMaybe<Scalars['String']>
    feature3_lte?: InputMaybe<Scalars['String']>
    feature3_not?: InputMaybe<Scalars['String']>
    feature3_not_contains?: InputMaybe<Scalars['String']>
    feature3_not_contains_nocase?: InputMaybe<Scalars['String']>
    feature3_not_ends_with?: InputMaybe<Scalars['String']>
    feature3_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    feature3_not_in?: InputMaybe<Array<Scalars['String']>>
    feature3_not_starts_with?: InputMaybe<Scalars['String']>
    feature3_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    feature3_starts_with?: InputMaybe<Scalars['String']>
    feature3_starts_with_nocase?: InputMaybe<Scalars['String']>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    lastCollectedAt?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_gt?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_gte?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    lastCollectedAt_lt?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_lte?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_not?: InputMaybe<Scalars['BigInt']>
    lastCollectedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    lastStakedAt?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_gt?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_gte?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    lastStakedAt_lt?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_lte?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_not?: InputMaybe<Scalars['BigInt']>
    lastStakedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    owner?: InputMaybe<Scalars['Bytes']>
    owner_contains?: InputMaybe<Scalars['Bytes']>
    owner_in?: InputMaybe<Array<Scalars['Bytes']>>
    owner_not?: InputMaybe<Scalars['Bytes']>
    owner_not_contains?: InputMaybe<Scalars['Bytes']>
    owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>
    partner?: InputMaybe<Scalars['Boolean']>
    partner_in?: InputMaybe<Array<Scalars['Boolean']>>
    partner_not?: InputMaybe<Scalars['Boolean']>
    partner_not_in?: InputMaybe<Array<Scalars['Boolean']>>
    realmId?: InputMaybe<Scalars['String']>
    realmIdNum?: InputMaybe<Scalars['Int']>
    realmIdNum_gt?: InputMaybe<Scalars['Int']>
    realmIdNum_gte?: InputMaybe<Scalars['Int']>
    realmIdNum_in?: InputMaybe<Array<Scalars['Int']>>
    realmIdNum_lt?: InputMaybe<Scalars['Int']>
    realmIdNum_lte?: InputMaybe<Scalars['Int']>
    realmIdNum_not?: InputMaybe<Scalars['Int']>
    realmIdNum_not_in?: InputMaybe<Array<Scalars['Int']>>
    realmId_contains?: InputMaybe<Scalars['String']>
    realmId_contains_nocase?: InputMaybe<Scalars['String']>
    realmId_ends_with?: InputMaybe<Scalars['String']>
    realmId_ends_with_nocase?: InputMaybe<Scalars['String']>
    realmId_gt?: InputMaybe<Scalars['String']>
    realmId_gte?: InputMaybe<Scalars['String']>
    realmId_in?: InputMaybe<Array<Scalars['String']>>
    realmId_lt?: InputMaybe<Scalars['String']>
    realmId_lte?: InputMaybe<Scalars['String']>
    realmId_not?: InputMaybe<Scalars['String']>
    realmId_not_contains?: InputMaybe<Scalars['String']>
    realmId_not_contains_nocase?: InputMaybe<Scalars['String']>
    realmId_not_ends_with?: InputMaybe<Scalars['String']>
    realmId_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realmId_not_in?: InputMaybe<Array<Scalars['String']>>
    realmId_not_starts_with?: InputMaybe<Scalars['String']>
    realmId_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realmId_starts_with?: InputMaybe<Scalars['String']>
    realmId_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceId?: InputMaybe<Scalars['BigInt']>
    resourceId_gt?: InputMaybe<Scalars['BigInt']>
    resourceId_gte?: InputMaybe<Scalars['BigInt']>
    resourceId_in?: InputMaybe<Array<Scalars['BigInt']>>
    resourceId_lt?: InputMaybe<Scalars['BigInt']>
    resourceId_lte?: InputMaybe<Scalars['BigInt']>
    resourceId_not?: InputMaybe<Scalars['BigInt']>
    resourceId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    size?: InputMaybe<Scalars['BigInt']>
    size_gt?: InputMaybe<Scalars['BigInt']>
    size_gte?: InputMaybe<Scalars['BigInt']>
    size_in?: InputMaybe<Array<Scalars['BigInt']>>
    size_lt?: InputMaybe<Scalars['BigInt']>
    size_lte?: InputMaybe<Scalars['BigInt']>
    size_not?: InputMaybe<Scalars['BigInt']>
    size_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    staked?: InputMaybe<Scalars['Boolean']>
    stakedBy?: InputMaybe<Scalars['Bytes']>
    stakedBy_contains?: InputMaybe<Scalars['Bytes']>
    stakedBy_in?: InputMaybe<Array<Scalars['Bytes']>>
    stakedBy_not?: InputMaybe<Scalars['Bytes']>
    stakedBy_not_contains?: InputMaybe<Scalars['Bytes']>
    stakedBy_not_in?: InputMaybe<Array<Scalars['Bytes']>>
    staked_in?: InputMaybe<Array<Scalars['Boolean']>>
    staked_not?: InputMaybe<Scalars['Boolean']>
    staked_not_in?: InputMaybe<Array<Scalars['Boolean']>>
    terraformedAt?: InputMaybe<Scalars['BigInt']>
    terraformedAt_gt?: InputMaybe<Scalars['BigInt']>
    terraformedAt_gte?: InputMaybe<Scalars['BigInt']>
    terraformedAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    terraformedAt_lt?: InputMaybe<Scalars['BigInt']>
    terraformedAt_lte?: InputMaybe<Scalars['BigInt']>
    terraformedAt_not?: InputMaybe<Scalars['BigInt']>
    terraformedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Realm_OrderBy {
    buildQueueSlot = 'buildQueueSlot',
    buildQueues = 'buildQueues',
    cities = 'cities',
    cityBuildTime = 'cityBuildTime',
    collectTime = 'collectTime',
    createdAt = 'createdAt',
    feature1 = 'feature1',
    feature2 = 'feature2',
    feature3 = 'feature3',
    id = 'id',
    lastCollectedAt = 'lastCollectedAt',
    lastStakedAt = 'lastStakedAt',
    metrics = 'metrics',
    name = 'name',
    owner = 'owner',
    partner = 'partner',
    realmId = 'realmId',
    realmIdNum = 'realmIdNum',
    resourceId = 'resourceId',
    size = 'size',
    staked = 'staked',
    stakedBy = 'stakedBy',
    supplies = 'supplies',
    terraformedAt = 'terraformedAt',
    totalStructures = 'totalStructures',
}

export type ResearchLab = {
    __typename?: 'ResearchLab'
    aquariumId: Scalars['BigInt']
    createdAt: Scalars['BigInt']
    id: Scalars['ID']
    realm: Realm
}

export type ResearchLab_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    aquariumId?: InputMaybe<Scalars['BigInt']>
    aquariumId_gt?: InputMaybe<Scalars['BigInt']>
    aquariumId_gte?: InputMaybe<Scalars['BigInt']>
    aquariumId_in?: InputMaybe<Array<Scalars['BigInt']>>
    aquariumId_lt?: InputMaybe<Scalars['BigInt']>
    aquariumId_lte?: InputMaybe<Scalars['BigInt']>
    aquariumId_not?: InputMaybe<Scalars['BigInt']>
    aquariumId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt?: InputMaybe<Scalars['BigInt']>
    createdAt_gt?: InputMaybe<Scalars['BigInt']>
    createdAt_gte?: InputMaybe<Scalars['BigInt']>
    createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>
    createdAt_lt?: InputMaybe<Scalars['BigInt']>
    createdAt_lte?: InputMaybe<Scalars['BigInt']>
    createdAt_not?: InputMaybe<Scalars['BigInt']>
    createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum ResearchLab_OrderBy {
    aquariumId = 'aquariumId',
    createdAt = 'createdAt',
    id = 'id',
    realm = 'realm',
}

export type Resource = {
    __typename?: 'Resource'
    id: Scalars['ID']
    realm: Realm
    resourceId: Scalars['String']
    resourceName: Scalars['String']
    totalLegacyResource: Scalars['BigInt']
    totalResource: Scalars['BigInt']
    type: Scalars['String']
}

export type Resource_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceId?: InputMaybe<Scalars['String']>
    resourceId_contains?: InputMaybe<Scalars['String']>
    resourceId_contains_nocase?: InputMaybe<Scalars['String']>
    resourceId_ends_with?: InputMaybe<Scalars['String']>
    resourceId_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_gt?: InputMaybe<Scalars['String']>
    resourceId_gte?: InputMaybe<Scalars['String']>
    resourceId_in?: InputMaybe<Array<Scalars['String']>>
    resourceId_lt?: InputMaybe<Scalars['String']>
    resourceId_lte?: InputMaybe<Scalars['String']>
    resourceId_not?: InputMaybe<Scalars['String']>
    resourceId_not_contains?: InputMaybe<Scalars['String']>
    resourceId_not_contains_nocase?: InputMaybe<Scalars['String']>
    resourceId_not_ends_with?: InputMaybe<Scalars['String']>
    resourceId_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_not_in?: InputMaybe<Array<Scalars['String']>>
    resourceId_not_starts_with?: InputMaybe<Scalars['String']>
    resourceId_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_starts_with?: InputMaybe<Scalars['String']>
    resourceId_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceName?: InputMaybe<Scalars['String']>
    resourceName_contains?: InputMaybe<Scalars['String']>
    resourceName_contains_nocase?: InputMaybe<Scalars['String']>
    resourceName_ends_with?: InputMaybe<Scalars['String']>
    resourceName_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_gt?: InputMaybe<Scalars['String']>
    resourceName_gte?: InputMaybe<Scalars['String']>
    resourceName_in?: InputMaybe<Array<Scalars['String']>>
    resourceName_lt?: InputMaybe<Scalars['String']>
    resourceName_lte?: InputMaybe<Scalars['String']>
    resourceName_not?: InputMaybe<Scalars['String']>
    resourceName_not_contains?: InputMaybe<Scalars['String']>
    resourceName_not_contains_nocase?: InputMaybe<Scalars['String']>
    resourceName_not_ends_with?: InputMaybe<Scalars['String']>
    resourceName_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_not_in?: InputMaybe<Array<Scalars['String']>>
    resourceName_not_starts_with?: InputMaybe<Scalars['String']>
    resourceName_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_starts_with?: InputMaybe<Scalars['String']>
    resourceName_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalLegacyResource?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_gt?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_gte?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalLegacyResource_lt?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_lte?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_not?: InputMaybe<Scalars['BigInt']>
    totalLegacyResource_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResource?: InputMaybe<Scalars['BigInt']>
    totalResource_gt?: InputMaybe<Scalars['BigInt']>
    totalResource_gte?: InputMaybe<Scalars['BigInt']>
    totalResource_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResource_lt?: InputMaybe<Scalars['BigInt']>
    totalResource_lte?: InputMaybe<Scalars['BigInt']>
    totalResource_not?: InputMaybe<Scalars['BigInt']>
    totalResource_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    type?: InputMaybe<Scalars['String']>
    type_contains?: InputMaybe<Scalars['String']>
    type_contains_nocase?: InputMaybe<Scalars['String']>
    type_ends_with?: InputMaybe<Scalars['String']>
    type_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_gt?: InputMaybe<Scalars['String']>
    type_gte?: InputMaybe<Scalars['String']>
    type_in?: InputMaybe<Array<Scalars['String']>>
    type_lt?: InputMaybe<Scalars['String']>
    type_lte?: InputMaybe<Scalars['String']>
    type_not?: InputMaybe<Scalars['String']>
    type_not_contains?: InputMaybe<Scalars['String']>
    type_not_contains_nocase?: InputMaybe<Scalars['String']>
    type_not_ends_with?: InputMaybe<Scalars['String']>
    type_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_not_in?: InputMaybe<Array<Scalars['String']>>
    type_not_starts_with?: InputMaybe<Scalars['String']>
    type_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    type_starts_with?: InputMaybe<Scalars['String']>
    type_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Resource_OrderBy {
    id = 'id',
    realm = 'realm',
    resourceId = 'resourceId',
    resourceName = 'resourceName',
    totalLegacyResource = 'totalLegacyResource',
    totalResource = 'totalResource',
    type = 'type',
}

export type Stat = {
    __typename?: 'Stat'
    id: Scalars['ID']
    totalAquariums: Scalars['BigInt']
    totalCities: Scalars['BigInt']
    totalCollects: Scalars['BigInt']
    totalFarms: Scalars['BigInt']
    totalRealms: Scalars['BigInt']
    totalResearchLabs: Scalars['BigInt']
    totalResourceAddedTransactions: Scalars['BigInt']
    totalResources: Scalars['BigInt']
    totalStaked: Scalars['BigInt']
}

export type Stat_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    totalAquariums?: InputMaybe<Scalars['BigInt']>
    totalAquariums_gt?: InputMaybe<Scalars['BigInt']>
    totalAquariums_gte?: InputMaybe<Scalars['BigInt']>
    totalAquariums_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAquariums_lt?: InputMaybe<Scalars['BigInt']>
    totalAquariums_lte?: InputMaybe<Scalars['BigInt']>
    totalAquariums_not?: InputMaybe<Scalars['BigInt']>
    totalAquariums_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCities?: InputMaybe<Scalars['BigInt']>
    totalCities_gt?: InputMaybe<Scalars['BigInt']>
    totalCities_gte?: InputMaybe<Scalars['BigInt']>
    totalCities_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCities_lt?: InputMaybe<Scalars['BigInt']>
    totalCities_lte?: InputMaybe<Scalars['BigInt']>
    totalCities_not?: InputMaybe<Scalars['BigInt']>
    totalCities_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCollects?: InputMaybe<Scalars['BigInt']>
    totalCollects_gt?: InputMaybe<Scalars['BigInt']>
    totalCollects_gte?: InputMaybe<Scalars['BigInt']>
    totalCollects_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCollects_lt?: InputMaybe<Scalars['BigInt']>
    totalCollects_lte?: InputMaybe<Scalars['BigInt']>
    totalCollects_not?: InputMaybe<Scalars['BigInt']>
    totalCollects_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalFarms?: InputMaybe<Scalars['BigInt']>
    totalFarms_gt?: InputMaybe<Scalars['BigInt']>
    totalFarms_gte?: InputMaybe<Scalars['BigInt']>
    totalFarms_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalFarms_lt?: InputMaybe<Scalars['BigInt']>
    totalFarms_lte?: InputMaybe<Scalars['BigInt']>
    totalFarms_not?: InputMaybe<Scalars['BigInt']>
    totalFarms_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalRealms?: InputMaybe<Scalars['BigInt']>
    totalRealms_gt?: InputMaybe<Scalars['BigInt']>
    totalRealms_gte?: InputMaybe<Scalars['BigInt']>
    totalRealms_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalRealms_lt?: InputMaybe<Scalars['BigInt']>
    totalRealms_lte?: InputMaybe<Scalars['BigInt']>
    totalRealms_not?: InputMaybe<Scalars['BigInt']>
    totalRealms_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResearchLabs?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_gt?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_gte?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResearchLabs_lt?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_lte?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_not?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResourceAddedTransactions?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_gt?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_gte?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResourceAddedTransactions_lt?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_lte?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_not?: InputMaybe<Scalars['BigInt']>
    totalResourceAddedTransactions_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResources?: InputMaybe<Scalars['BigInt']>
    totalResources_gt?: InputMaybe<Scalars['BigInt']>
    totalResources_gte?: InputMaybe<Scalars['BigInt']>
    totalResources_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResources_lt?: InputMaybe<Scalars['BigInt']>
    totalResources_lte?: InputMaybe<Scalars['BigInt']>
    totalResources_not?: InputMaybe<Scalars['BigInt']>
    totalResources_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalStaked?: InputMaybe<Scalars['BigInt']>
    totalStaked_gt?: InputMaybe<Scalars['BigInt']>
    totalStaked_gte?: InputMaybe<Scalars['BigInt']>
    totalStaked_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalStaked_lt?: InputMaybe<Scalars['BigInt']>
    totalStaked_lte?: InputMaybe<Scalars['BigInt']>
    totalStaked_not?: InputMaybe<Scalars['BigInt']>
    totalStaked_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Stat_OrderBy {
    id = 'id',
    totalAquariums = 'totalAquariums',
    totalCities = 'totalCities',
    totalCollects = 'totalCollects',
    totalFarms = 'totalFarms',
    totalRealms = 'totalRealms',
    totalResearchLabs = 'totalResearchLabs',
    totalResourceAddedTransactions = 'totalResourceAddedTransactions',
    totalResources = 'totalResources',
    totalStaked = 'totalStaked',
}

export type Subscription = {
    __typename?: 'Subscription'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    activities: Array<Activity>
    activity?: Maybe<Activity>
    aquarium?: Maybe<Aquarium>
    aquariums: Array<Aquarium>
    buildQueue?: Maybe<BuildQueue>
    buildQueueSlot?: Maybe<BuildQueueSlot>
    buildQueueSlots: Array<BuildQueueSlot>
    buildQueues: Array<BuildQueue>
    cities: Array<City>
    city?: Maybe<City>
    collect?: Maybe<Collect>
    collects: Array<Collect>
    farm?: Maybe<Farm>
    farms: Array<Farm>
    metric?: Maybe<Metric>
    metrics: Array<Metric>
    owner?: Maybe<Owner>
    owners: Array<Owner>
    realm?: Maybe<Realm>
    realmId?: Maybe<RealmId>
    realmIds: Array<RealmId>
    realms: Array<Realm>
    researchLab?: Maybe<ResearchLab>
    researchLabs: Array<ResearchLab>
    resource?: Maybe<Resource>
    resources: Array<Resource>
    stat?: Maybe<Stat>
    stats: Array<Stat>
    supplies: Array<Supply>
    supply?: Maybe<Supply>
    totalResource?: Maybe<TotalResource>
    totalResources: Array<TotalResource>
    totalStructure?: Maybe<TotalStructure>
    totalStructures: Array<TotalStructure>
}

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>
}

export type SubscriptionActivitiesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Activity_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Activity_Filter>
}

export type SubscriptionActivityArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAquariumArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAquariumsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Aquarium_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Aquarium_Filter>
}

export type SubscriptionBuildQueueArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionBuildQueueSlotArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionBuildQueueSlotsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueueSlot_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<BuildQueueSlot_Filter>
}

export type SubscriptionBuildQueuesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<BuildQueue_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<BuildQueue_Filter>
}

export type SubscriptionCitiesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<City_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<City_Filter>
}

export type SubscriptionCityArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionCollectArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionCollectsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Collect_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Collect_Filter>
}

export type SubscriptionFarmArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionFarmsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Farm_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Farm_Filter>
}

export type SubscriptionMetricArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionMetricsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Metric_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Metric_Filter>
}

export type SubscriptionOwnerArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionOwnersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Owner_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Owner_Filter>
}

export type SubscriptionRealmArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionRealmIdArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionRealmIdsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<RealmId_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<RealmId_Filter>
}

export type SubscriptionRealmsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Realm_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Realm_Filter>
}

export type SubscriptionResearchLabArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionResearchLabsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<ResearchLab_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<ResearchLab_Filter>
}

export type SubscriptionResourceArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionResourcesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Resource_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Resource_Filter>
}

export type SubscriptionStatArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionStatsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Stat_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Stat_Filter>
}

export type SubscriptionSuppliesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Supply_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Supply_Filter>
}

export type SubscriptionSupplyArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTotalResourceArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTotalResourcesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<TotalResource_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<TotalResource_Filter>
}

export type SubscriptionTotalStructureArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTotalStructuresArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<TotalStructure_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<TotalStructure_Filter>
}

export type Supply = {
    __typename?: 'Supply'
    id: Scalars['ID']
    name: Scalars['String']
    realm: Realm
    totalAmount: Scalars['BigInt']
    type: Scalars['BigInt']
}

export type Supply_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalAmount?: InputMaybe<Scalars['BigInt']>
    totalAmount_gt?: InputMaybe<Scalars['BigInt']>
    totalAmount_gte?: InputMaybe<Scalars['BigInt']>
    totalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAmount_lt?: InputMaybe<Scalars['BigInt']>
    totalAmount_lte?: InputMaybe<Scalars['BigInt']>
    totalAmount_not?: InputMaybe<Scalars['BigInt']>
    totalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    type?: InputMaybe<Scalars['BigInt']>
    type_gt?: InputMaybe<Scalars['BigInt']>
    type_gte?: InputMaybe<Scalars['BigInt']>
    type_in?: InputMaybe<Array<Scalars['BigInt']>>
    type_lt?: InputMaybe<Scalars['BigInt']>
    type_lte?: InputMaybe<Scalars['BigInt']>
    type_not?: InputMaybe<Scalars['BigInt']>
    type_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Supply_OrderBy {
    id = 'id',
    name = 'name',
    realm = 'realm',
    totalAmount = 'totalAmount',
    type = 'type',
}

export type TotalResource = {
    __typename?: 'TotalResource'
    id: Scalars['ID']
    resourceId: Scalars['String']
    resourceName: Scalars['String']
    total: Scalars['BigInt']
    type: Scalars['String']
}

export type TotalResource_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    resourceId?: InputMaybe<Scalars['String']>
    resourceId_contains?: InputMaybe<Scalars['String']>
    resourceId_contains_nocase?: InputMaybe<Scalars['String']>
    resourceId_ends_with?: InputMaybe<Scalars['String']>
    resourceId_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_gt?: InputMaybe<Scalars['String']>
    resourceId_gte?: InputMaybe<Scalars['String']>
    resourceId_in?: InputMaybe<Array<Scalars['String']>>
    resourceId_lt?: InputMaybe<Scalars['String']>
    resourceId_lte?: InputMaybe<Scalars['String']>
    resourceId_not?: InputMaybe<Scalars['String']>
    resourceId_not_contains?: InputMaybe<Scalars['String']>
    resourceId_not_contains_nocase?: InputMaybe<Scalars['String']>
    resourceId_not_ends_with?: InputMaybe<Scalars['String']>
    resourceId_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_not_in?: InputMaybe<Array<Scalars['String']>>
    resourceId_not_starts_with?: InputMaybe<Scalars['String']>
    resourceId_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceId_starts_with?: InputMaybe<Scalars['String']>
    resourceId_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceName?: InputMaybe<Scalars['String']>
    resourceName_contains?: InputMaybe<Scalars['String']>
    resourceName_contains_nocase?: InputMaybe<Scalars['String']>
    resourceName_ends_with?: InputMaybe<Scalars['String']>
    resourceName_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_gt?: InputMaybe<Scalars['String']>
    resourceName_gte?: InputMaybe<Scalars['String']>
    resourceName_in?: InputMaybe<Array<Scalars['String']>>
    resourceName_lt?: InputMaybe<Scalars['String']>
    resourceName_lte?: InputMaybe<Scalars['String']>
    resourceName_not?: InputMaybe<Scalars['String']>
    resourceName_not_contains?: InputMaybe<Scalars['String']>
    resourceName_not_contains_nocase?: InputMaybe<Scalars['String']>
    resourceName_not_ends_with?: InputMaybe<Scalars['String']>
    resourceName_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_not_in?: InputMaybe<Array<Scalars['String']>>
    resourceName_not_starts_with?: InputMaybe<Scalars['String']>
    resourceName_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    resourceName_starts_with?: InputMaybe<Scalars['String']>
    resourceName_starts_with_nocase?: InputMaybe<Scalars['String']>
    total?: InputMaybe<Scalars['BigInt']>
    total_gt?: InputMaybe<Scalars['BigInt']>
    total_gte?: InputMaybe<Scalars['BigInt']>
    total_in?: InputMaybe<Array<Scalars['BigInt']>>
    total_lt?: InputMaybe<Scalars['BigInt']>
    total_lte?: InputMaybe<Scalars['BigInt']>
    total_not?: InputMaybe<Scalars['BigInt']>
    total_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    type?: InputMaybe<Scalars['String']>
    type_contains?: InputMaybe<Scalars['String']>
    type_contains_nocase?: InputMaybe<Scalars['String']>
    type_ends_with?: InputMaybe<Scalars['String']>
    type_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_gt?: InputMaybe<Scalars['String']>
    type_gte?: InputMaybe<Scalars['String']>
    type_in?: InputMaybe<Array<Scalars['String']>>
    type_lt?: InputMaybe<Scalars['String']>
    type_lte?: InputMaybe<Scalars['String']>
    type_not?: InputMaybe<Scalars['String']>
    type_not_contains?: InputMaybe<Scalars['String']>
    type_not_contains_nocase?: InputMaybe<Scalars['String']>
    type_not_ends_with?: InputMaybe<Scalars['String']>
    type_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    type_not_in?: InputMaybe<Array<Scalars['String']>>
    type_not_starts_with?: InputMaybe<Scalars['String']>
    type_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    type_starts_with?: InputMaybe<Scalars['String']>
    type_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum TotalResource_OrderBy {
    id = 'id',
    resourceId = 'resourceId',
    resourceName = 'resourceName',
    total = 'total',
    type = 'type',
}

export type TotalStructure = {
    __typename?: 'TotalStructure'
    id: Scalars['ID']
    realm: Realm
    totalAquariums: Scalars['BigInt']
    totalCities: Scalars['BigInt']
    totalFarms: Scalars['BigInt']
    totalResearchLabs: Scalars['BigInt']
}

export type TotalStructure_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    realm?: InputMaybe<Scalars['String']>
    realm_contains?: InputMaybe<Scalars['String']>
    realm_contains_nocase?: InputMaybe<Scalars['String']>
    realm_ends_with?: InputMaybe<Scalars['String']>
    realm_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_gt?: InputMaybe<Scalars['String']>
    realm_gte?: InputMaybe<Scalars['String']>
    realm_in?: InputMaybe<Array<Scalars['String']>>
    realm_lt?: InputMaybe<Scalars['String']>
    realm_lte?: InputMaybe<Scalars['String']>
    realm_not?: InputMaybe<Scalars['String']>
    realm_not_contains?: InputMaybe<Scalars['String']>
    realm_not_contains_nocase?: InputMaybe<Scalars['String']>
    realm_not_ends_with?: InputMaybe<Scalars['String']>
    realm_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    realm_not_in?: InputMaybe<Array<Scalars['String']>>
    realm_not_starts_with?: InputMaybe<Scalars['String']>
    realm_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    realm_starts_with?: InputMaybe<Scalars['String']>
    realm_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalAquariums?: InputMaybe<Scalars['BigInt']>
    totalAquariums_gt?: InputMaybe<Scalars['BigInt']>
    totalAquariums_gte?: InputMaybe<Scalars['BigInt']>
    totalAquariums_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalAquariums_lt?: InputMaybe<Scalars['BigInt']>
    totalAquariums_lte?: InputMaybe<Scalars['BigInt']>
    totalAquariums_not?: InputMaybe<Scalars['BigInt']>
    totalAquariums_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCities?: InputMaybe<Scalars['BigInt']>
    totalCities_gt?: InputMaybe<Scalars['BigInt']>
    totalCities_gte?: InputMaybe<Scalars['BigInt']>
    totalCities_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalCities_lt?: InputMaybe<Scalars['BigInt']>
    totalCities_lte?: InputMaybe<Scalars['BigInt']>
    totalCities_not?: InputMaybe<Scalars['BigInt']>
    totalCities_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalFarms?: InputMaybe<Scalars['BigInt']>
    totalFarms_gt?: InputMaybe<Scalars['BigInt']>
    totalFarms_gte?: InputMaybe<Scalars['BigInt']>
    totalFarms_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalFarms_lt?: InputMaybe<Scalars['BigInt']>
    totalFarms_lte?: InputMaybe<Scalars['BigInt']>
    totalFarms_not?: InputMaybe<Scalars['BigInt']>
    totalFarms_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResearchLabs?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_gt?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_gte?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalResearchLabs_lt?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_lte?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_not?: InputMaybe<Scalars['BigInt']>
    totalResearchLabs_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum TotalStructure_OrderBy {
    id = 'id',
    realm = 'realm',
    totalAquariums = 'totalAquariums',
    totalCities = 'totalCities',
    totalFarms = 'totalFarms',
    totalResearchLabs = 'totalResearchLabs',
}

export type _Block_ = {
    __typename?: '_Block_'
    /** The hash of the block */
    hash?: Maybe<Scalars['Bytes']>
    /** The block number */
    number: Scalars['Int']
}

/** The type for the top-level _meta field */
export type _Meta_ = {
    __typename?: '_Meta_'
    /**
     * Information about a specific subgraph block. The hash of the block
     * will be null if the _meta field has a block constraint that asks for
     * a block number. It will be filled if the _meta field has no block constraint
     * and therefore asks for the latest  block
     *
     */
    block: _Block_
    /** The deployment ID */
    deployment: Scalars['String']
    /** If `true`, the subgraph encountered indexing errors at some past block */
    hasIndexingErrors: Scalars['Boolean']
}

export enum _SubgraphErrorPolicy_ {
    /** Data will be returned even if the subgraph has indexing errors */
    allow = 'allow',
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    deny = 'deny',
}

export type GetRealmMetadataQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetRealmMetadataQuery = {
    __typename?: 'Query'
    realms: Array<{
        __typename?: 'Realm'
        id: string
        feature1: string
        feature2: string
        feature3: string
        metrics: Array<{ __typename?: 'Metric'; name: string; totalAmount: string }>
        totalStructures: Array<{
            __typename?: 'TotalStructure'
            totalAquariums: string
            totalCities: string
            totalFarms: string
            totalResearchLabs: string
        }>
    }>
}

export type GetFilteredFeaturesQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
    feature?: InputMaybe<Array<Scalars['String']> | Scalars['String']>
}>

export type GetFilteredFeaturesQuery = {
    __typename?: 'Query'
    feature1: Array<{ __typename?: 'Realm'; id: string }>
    feature2: Array<{ __typename?: 'Realm'; id: string }>
    feature3: Array<{ __typename?: 'Realm'; id: string }>
}

export type GetFilteredStructuresQueryVariables = Exact<{
    filters: TotalStructure_Filter
}>

export type GetFilteredStructuresQuery = {
    __typename?: 'Query'
    totalStructures: Array<{ __typename?: 'TotalStructure'; id: string }>
}

export const GetRealmMetadataDocument = gql`
    query getRealmMetadata($ids: [ID!]!) {
        realms(first: 1000, where: { id_in: $ids }) {
            id
            feature1
            feature2
            feature3
            metrics {
                name
                totalAmount
            }
            totalStructures {
                totalAquariums
                totalCities
                totalFarms
                totalResearchLabs
            }
        }
    }
`
export const GetFilteredFeaturesDocument = gql`
    query getFilteredFeatures($ids: [ID!]!, $feature: [String!]) {
        feature1: realms(first: 1000, where: { id_in: $ids, feature1_in: $feature }) {
            id
        }
        feature2: realms(first: 1000, where: { id_in: $ids, feature2_in: $feature }) {
            id
        }
        feature3: realms(first: 1000, where: { id_in: $ids, feature3_in: $feature }) {
            id
        }
    }
`
export const GetFilteredStructuresDocument = gql`
    query getFilteredStructures($filters: TotalStructure_filter!) {
        totalStructures(first: 1000, where: $filters) {
            id
        }
    }
`

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action()

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        getRealmMetadata(
            variables: GetRealmMetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetRealmMetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetRealmMetadataQuery>(GetRealmMetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getRealmMetadata',
                'query',
            )
        },
        getFilteredFeatures(
            variables: GetFilteredFeaturesQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetFilteredFeaturesQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetFilteredFeaturesQuery>(GetFilteredFeaturesDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getFilteredFeatures',
                'query',
            )
        },
        getFilteredStructures(
            variables: GetFilteredStructuresQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetFilteredStructuresQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetFilteredStructuresQuery>(GetFilteredStructuresDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getFilteredStructures',
                'query',
            )
        },
    }
}
export type Sdk = ReturnType<typeof getSdk>
