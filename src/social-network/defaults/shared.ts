import { bypass, regexMatch, regexMatchAll } from '../../utils/utils'
import { cloneDeep } from 'lodash-es'

export const defaultSharedSettings = cloneDeep({
    publicKeyEncoder: (text: string) => `🔒${text}🔒`,
    publicKeyDecoder: (text: string) => regexMatchAll(text, /🔒([\dA-Za-z+=\/]{20,60})🔒/) ?? [],
    payloadEncoder: bypass,
    payloadDecoder: bypass,
    notReadyForProduction: false,
} as const)
