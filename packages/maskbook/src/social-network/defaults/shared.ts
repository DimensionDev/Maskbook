import { regexMatchAll } from '../../utils/utils'
import { cloneDeep, identity } from 'lodash-es'

export const defaultSharedSettings = cloneDeep({
    publicKeyEncoder: (text: string) => `🔒${text}🔒`,
    publicKeyDecoder: (text: string) => regexMatchAll(text, /🔒([\dA-Za-z+=\/]{20,60})🔒/) ?? [],
    payloadEncoder: identity,
    payloadDecoder: identity,
    notReadyForProduction: false,
} as const)
