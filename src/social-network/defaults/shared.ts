import { regexMatch } from '../../utils/utils'
import { cloneDeep } from 'lodash-es'

export const defaultSharedSettings = cloneDeep({
    publicKeyEncoder: (text: string) => `🔒${text}🔒`,
    publicKeyDecoder: (text: string) => regexMatch(text, /(🔒)(.+)(🔒)/, 2),
    notReadyForProduction: false,
})
