import { omit } from 'lodash-es'
import type { BigNumber } from 'bignumber.js'
import type { Result } from 'ts-results-es'
import { type ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import type { TypedMessage } from '@masknet/typed-message'
import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message-react'
import { ITO_MetaKey_1, ITO_MetaKey_2 } from '../constants.js'
import type { JSON_PayloadInMask, JSON_PayloadOutMask } from '../types.js'
import schemaV1 from '../schema-v1.json'
import schemaV2 from '../schema-v2.json'
import { CrossIsolationMessages } from '@masknet/shared-base'

// Note: if the latest version has been changed, please update packages/mask/src/components/CompositionDialog/useSubmit.ts
const reader_v1 = createTypedMessageMetadataReader<JSON_PayloadOutMask>(ITO_MetaKey_1, schemaV1)
const reader_v2 = createTypedMessageMetadataReader<JSON_PayloadOutMask>(ITO_MetaKey_2, schemaV2)
export const renderWithITO_Metadata = createRenderWithMetadata(ITO_MetadataReader)
export function ITO_MetadataReader(meta: TypedMessage['meta']): Result<JSON_PayloadOutMask, void> {
    const v2 = reader_v2(meta)
    if (v2.ok) return v2
    return reader_v1(meta)
}

/**
 * The greatest common divisor
 */
export function gcd(a: BigNumber, b: BigNumber) {
    a = a.abs()
    b = b.abs()
    if (b.isGreaterThan(a)) {
        const temp = b
        b = a
        a = temp
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (b.isZero()) return a
        a = a.mod(b)
        if (a.isZero()) return b
        b = b.mod(a)
    }
}

export function sortTokens(
    tokenA: {
        address: string
    },
    tokenB: {
        address: string
    },
) {
    const addressA = tokenA.address.toLowerCase()
    const addressB = tokenB.address.toLowerCase()
    if (isNativeTokenAddress(addressA)) return -1
    if (isNativeTokenAddress(addressB)) return 1
    return addressA < addressB ? -1 : 1
}

export function timestampInMask(timestamp: number) {
    return timestamp * 1000
}

export function timestampOutMask(timestamp: number) {
    return Math.floor(timestamp / 1000)
}

export function tokenIntoMask<
    T extends {
        chain_id: ChainId
    },
>(token: T) {
    return {
        ...omit(token, 'chain_id'),
        chainId: token.chain_id,
    } as unknown as Omit<T, 'chain_id'> & {
        chainId: ChainId
    }
}

export function tokenOutMask<
    T extends {
        chainId: ChainId
    },
>(token: T) {
    return {
        ...omit(token, 'chainId'),
        chain_id: token.chainId,
    } as Omit<T, 'chainId'> & {
        chain_id: ChainId
    }
}

export function payloadIntoMask(payload: JSON_PayloadOutMask) {
    return {
        ...payload,
        start_time: timestampInMask(payload.start_time),
        end_time: timestampInMask(payload.end_time),
        creation_time: timestampInMask(payload.creation_time),
        token: tokenIntoMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenIntoMask).sort(sortTokens),
    } as JSON_PayloadInMask
}

export function payloadOutMask(payload: JSON_PayloadInMask) {
    return {
        ...payload,
        start_time: timestampOutMask(payload.start_time),
        end_time: timestampOutMask(payload.end_time),
        creation_time: timestampOutMask(payload.creation_time),
        token: tokenOutMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenOutMask),
    } as JSON_PayloadOutMask
}

export function payloadOutMaskCompact(payload: JSON_PayloadInMask) {
    return {
        ...payload,

        // HOTFIX of image payload for ITO
        // remove unnecessary chunks of data to reduce the size of payload
        token: tokenOutMask(payload.token),
        contract_address: '',
        message: '',
        start_time: 0,
        end_time: 0,
        creation_time: 0,
        limit: '0',
        total_remaining: '0',
        exchange_amounts: [],
        exchange_tokens: [],
    } as JSON_PayloadOutMask
}

export function isCompactPayload(payload: JSON_PayloadInMask) {
    return !payload.exchange_tokens.length
}

export function openComposition(metadataKey: string, payload: unknown) {
    // Close the duplicated dialog if already opened by clicking the mask compose icon.
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({ reason: 'popup', open: false })
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            initialMetas: {
                [metadataKey]: payload,
            },
        },
    })
}
