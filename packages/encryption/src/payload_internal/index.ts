import type { CheckedError } from '@masknet/base'
import type { Result } from 'ts-results-es'
import type { PayloadParseResult } from '../index.js'
import type { CryptoException, PayloadException } from '../types/index.js'

export type PayloadParserResult = Promise<
    Result<PayloadParseResult.Payload, CheckedError<CryptoException | PayloadException>>
>
export { parse40 } from './version-40.js'
export { parse39 } from './version-39.js'
export { parse38 } from './version-38.parser.js'
// Remove v38 encoder after
export { encode38 } from './version-38.encoder.js'
export { parse37 } from './version-37.parser.js'
export { encode37 } from './version-37.encoder.js'
