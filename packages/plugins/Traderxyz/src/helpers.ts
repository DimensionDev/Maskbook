import { type TypedMessage, createTypedMessageMetadataReader } from '@masknet/typed-message'
import type { TradeMetaData } from './types'
import { META_KEY } from './constants'
import schema from './schema.json'
import type { Result } from 'ts-results'
import BigNumber from 'bignumber.js'

const reader_v2 = createTypedMessageMetadataReader<TradeMetaData>(META_KEY, schema)

export function TradeMetadataReader(meta: TypedMessage['meta']): Result<TradeMetaData, void> {
    return reader_v2(meta)
}

export function amountToWei(amount: BigNumber.Value, decimals: number) {
    return new BigNumber(amount).shiftedBy(decimals).toString()
}
