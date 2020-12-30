import type BigNumber from 'bignumber.js'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { ITO_MetaKey } from './constants'
import type { JSON_PayloadInMask, JSON_PayloadOutMask } from './types'
import schema from './schema.json'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'
import { omit } from 'lodash-es'
import { getConstant, isSameAddress } from '../../web3/helpers'
import { CONSTANTS } from '../../web3/constants'

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

export function sortTokens(tokenA: { address: string }, tokenB: { address: string }) {
    const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')
    if (isSameAddress(tokenA.address, ETH_ADDRESS)) return -1
    if (isSameAddress(tokenA.address, ETH_ADDRESS)) return 1
    return tokenA.address < tokenB.address ? -1 : 1
}

export function tokenIntoMask(token: JSON_PayloadOutMask['token']) {
    return ({
        ...omit(token, 'chain_id'),
        chainId: token.chain_id,
    } as unknown) as EtherTokenDetailed | ERC20TokenDetailed
}

export function tokenOutMask(token: EtherTokenDetailed | ERC20TokenDetailed) {
    return {
        ...omit(token, 'chainId'),
        chain_id: token.chainId,
    } as JSON_PayloadOutMask['token']
}

export function payloadIntoMask(payload: JSON_PayloadOutMask) {
    return {
        ...payload,
        token: tokenIntoMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenIntoMask).sort(sortTokens),
    } as JSON_PayloadInMask
}

export function payloadOutMask(payload: JSON_PayloadInMask) {
    return {
        ...payload,
        token: tokenOutMask(payload.token),
        exchange_tokens: payload.exchange_tokens.map(tokenOutMask).sort(sortTokens),
    } as JSON_PayloadOutMask
}
