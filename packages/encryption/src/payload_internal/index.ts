import type { Result } from 'ts-results'
import type { PayloadParseResult } from '..'
import type { Exception, DecodeExceptions } from '../types'
export type PayloadParserResult = Promise<Result<PayloadParseResult.Payload, Exception<DecodeExceptions>>>
export { parse40 } from './version-40'
export { parse39 } from './version-39'
export { parse38 } from './version-38'
