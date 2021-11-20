import type { Result } from 'ts-results'
import type { PayloadParseResult } from '..'
import type { EKindsError, CryptoException, PayloadException } from '../types'

export type PayloadParserResult = Promise<
    Result<PayloadParseResult.Payload, EKindsError<CryptoException | PayloadException>>
>
export { parse40 } from './version-40'
export { parse39 } from './version-39'
export { parse38 } from './version-38.parser'
// Remove v38 encoder after
export { encode38 } from './version-38.encoder'
export { parse37 } from './version-37.parser'
export { encode37 } from './version-37.encoder'
