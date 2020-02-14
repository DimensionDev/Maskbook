import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { isNil } from 'lodash-es'
import { definedSocialNetworkWorkers } from '../../social-network/worker'
import { GetContext } from '@holoflows/kit/es'
import { safeGetActiveUI } from '../safeRequire'
import { i18n } from '../i18n-next'

export type Payload = PayloadAlpha40_Or_Alpha39 | PayloadAlpha38
export type PayloadLatest = PayloadAlpha38

export interface PayloadAlpha40_Or_Alpha39 {
    version: -40 | -39
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
export interface PayloadAlpha38 {
    version: -38
    AESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature: string
    authorPublicKey?: string
    sharedPublic?: boolean
}

/**
 * Detect if there is version -40, -39 or -38 payload
 */
function deconstructAlpha40_Or_Alpha39_Or_Alpha38(str: string, throws = false): Payload | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?:||
    // ? if publicShared is true, that means AESKeyEncrypted is shared with public
    // ? "1" treated as true, "0" or not defined treated as false
    const isVersion40 = str.includes('🎼2/4')
    const isVersion39 = str.includes('🎼3/4')
    const isVersion38 = str.includes('🎼4/4')
    str = str.replace('🎼2/4', '🎼3/4')
    str = str.replace('🎼3/4', '🎼4/4')
    const [_, payloadStart] = str.split('🎼4/4|')
    if (!payloadStart)
        if (throws) throw new Error(i18n.t('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(i18n.t('payload_incomplete'))
        else return null
    const [AESKeyEncrypted, iv, encryptedText, signature, authorPublicKey, publicShared, ...extra] = payload.split('|')
    if (!(AESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error(i18n.t('payload_bad'))
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    if (isVersion38) {
        if (!signature) throw new Error(i18n.t('payload_bad'))
        return {
            version: -38,
            AESKeyEncrypted,
            iv,
            encryptedText,
            signature,
            authorPublicKey,
            sharedPublic: publicShared === '1',
        }
    }
    return {
        ownersAESKeyEncrypted: AESKeyEncrypted,
        iv,
        encryptedText,
        signature,
        version: isVersion39 ? -39 : -40,
    }
}

function deconstructAlpha41(str: string, throws = false): null | never {
    // 🎼1/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    if (str.includes('🎼1/4') && str.includes(':||'))
        if (throws) throw new Error(i18n.t('payload_throw_in_alpha41'))
        else return null
    return null
}

const versions = new Set([deconstructAlpha40_Or_Alpha39_Or_Alpha38, deconstructAlpha41])

/**
 * @type Decoder    defines decoder. if null, auto select decoder.
 */
type Decoder = SocialNetworkWorkerAndUI['payloadDecoder'] | null
type Encoder = SocialNetworkWorkerAndUI['payloadEncoder']

export function deconstructPayload(str: string, decoder: Decoder, throws?: false): Payload | null
export function deconstructPayload(str: string, decoder: Decoder, throws?: true): Payload
export function deconstructPayload(str: string, decoder: Decoder, throws: boolean = false): Payload | null {
    const decoders = (() => {
        if (isNil(decoder)) {
            if (GetContext() === 'content') {
                return [safeGetActiveUI().payloadDecoder]
            }
            return Array.from(definedSocialNetworkWorkers).map(x => x.payloadDecoder)
        }
        return [decoder]
    })()

    if (decoders.length === 0) decoders.push(x => x)

    for (const versionDecoder of versions) {
        for (const networkDecoder of decoders) {
            if (isNil(networkDecoder(str))) continue
            const result = versionDecoder(networkDecoder(str)!, false)
            if (!isNil(result)) return result
        }
    }
    if (str.includes('🎼') && str.includes(':||'))
        if (throws) throw new TypeError(i18n.t('service_unknown_payload'))
        else return null
    if (throws) throw new TypeError(i18n.t('payload_not_found'))
    else return null
}

export function constructAlpha38(data: PayloadAlpha38, encoder: Encoder) {
    const fields = [data.AESKeyEncrypted, data.iv, data.encryptedText, data.signature]
    if (data.authorPublicKey) {
        fields.push(data.authorPublicKey)
        if (data.sharedPublic) fields.push('1')
        else fields.push('0')
    }
    return encoder(`🎼4/4|${fields.join('|')}:||`)
}

/**
 * The string part is in the front of the payload.
 * The number part is used in the database.
 */
export enum Versions {
    '2/4' = -40,
    '3/4' = -39,
    '4/4' = -38,
}
