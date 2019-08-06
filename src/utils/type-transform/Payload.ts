import { geti18nString } from '../i18n'

export interface PayloadAlpha40 {
    version: -40
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
/**
 * Detect if there is version -40 payload
 */
function deconstructAlpha40(str: string, throws = false): PayloadAlpha40 | null {
    // 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    const [_, payloadStart] = str.split('🎼2/4|')
    if (!payloadStart)
        if (throws) throw new Error(geti18nString('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(geti18nString('payload_incomplete'))
        else return null
    const [ownersAESKeyEncrypted, iv, encryptedText, signature, ...extra] = payload.split('|')
    if (!(ownersAESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error(geti18nString('payload_bad'))
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    return {
        ownersAESKeyEncrypted,
        iv,
        encryptedText,
        signature,
        version: -40,
    }
}
function deconstructAlpha41(str: string, throws = false): null | never {
    // 🎼1/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    if (str.includes('🎼1/4') && str.includes(':||'))
        if (throws) throw new Error(geti18nString('payload_throw_in_alpha41'))
        else return null
    return null
}

const versions = new Set([deconstructAlpha40, deconstructAlpha41])
export function deconstructPayload(str: string): PayloadAlpha40 | null
export function deconstructPayload(str: string, throws: true): PayloadAlpha40
export function deconstructPayload(str: string, throws = false): PayloadAlpha40 | null {
    for (const ver of versions) {
        const result = ver(str, false)
        if (throws === false) return result
        if (result) return result
        return ver(str, true)
    }
    if (str.includes('🎼') && str.includes(':||'))
        if (throws) throw new TypeError(geti18nString('service_unknown_payload'))
        else return null
    if (throws) throw new TypeError(geti18nString('payload_not_found'))
    else return null
}

export function constructAlpha40(data: PayloadAlpha40) {
    return `🎼2/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`
}
