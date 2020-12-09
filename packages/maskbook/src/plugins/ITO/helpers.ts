import type BigNumber from 'bignumber.js'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { ITO_MetaKey } from './constants'
import type { ITO_JSONPayload } from './types'
import schema from './schema.json'

export const ITO_MetadataReader = createTypedMessageMetadataReader<ITO_JSONPayload>(ITO_MetaKey, schema)
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
