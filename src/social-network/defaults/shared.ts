import { regexMatch } from '../../utils/utils'

export const defaultSharedSettings = {
    publicKeyEncoder: (text: string) => `🔒${text}🔒`,
    publicKeyDecoder: (text: string) => regexMatch(text, /(🔒)(.+)(🔒)/, 2)!,
    notReadyForProduction: false,
}
