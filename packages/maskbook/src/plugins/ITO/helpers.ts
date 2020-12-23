import type BigNumber from 'bignumber.js'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { ITO_MetaKey } from './constants'
import type { JSON_PayloadInMask, JSON_PayloadOutMask } from './types'
import schema from './schema.json'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'

export const ITO_MetadataReader = createTypedMessageMetadataReader<JSON_PayloadInMask>(ITO_MetaKey, schema)
export const renderWithITO_Metadata = createRenderWithMetadata(ITO_MetadataReader)

/**
 * The greatest common divisor
 */
export function gcd(a: BigNumber, b: BigNumber) {
    let a_ = a.abs()
    let b_ = b.abs()
    if (b_.isGreaterThan(a_)) {
        const temp = b_
        b_ = a_
        a_ = temp
    }
    while (true) {
        if (b_.isZero()) return a_
        a_ = a_.mod(b_)
        if (a_.isZero()) return b_
        b_ = b_.mod(a_)
    }
}

export function tokenIntoMask(token: JSON_PayloadOutMask['token']) {
    return ({
        ...token,
        chainId: token.chain_id,
    } as unknown) as EtherTokenDetailed | ERC20TokenDetailed
}

export function tokenOutMask(token: EtherTokenDetailed | ERC20TokenDetailed) {
    return {
        ...token,
        chain_id: token.chainId,
    } as JSON_PayloadOutMask['token']
}

export function payloadIntoMask(payload: JSON_PayloadOutMask) {
    return {
        ...payload,
        token: tokenIntoMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenIntoMask),
    } as JSON_PayloadInMask
}

export function payloadOutMask(payload: JSON_PayloadInMask) {
    return {
        ...payload,
        token: tokenOutMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenOutMask),
    } as JSON_PayloadOutMask
}
