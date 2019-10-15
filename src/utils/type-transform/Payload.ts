import { geti18nString } from '../i18n'
import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { isNil } from 'lodash-es'
import { definedSocialNetworkWorkers } from '../../social-network/worker'
import { getActivatedUI } from '../../social-network/ui'
import { GetContext } from '@holoflows/kit/es'

export type Payload = PayloadAlpha40_Or_Alpha39 | PayloadAlpha38

interface PayloadAlpha40_Or_Alpha39 {
    version: -40 | -39
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
interface PayloadAlpha38 {
    version: -38
    AESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature: string
    sharedPublic?: boolean
}

/**
 * Detect if there is version -40, -39 or -38 payload
 */
function deconstructAlpha40_Or_Alpha39_Or_Alpha38(str: string, throws = false): Payload | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|publicShared:||
    // ? if publicShared is true, that means AESKeyEncrypted is shared with public
    const isVersion40 = str.includes('🎼2/4')
    const isVersion39 = str.includes('🎼3/4')
    const isVersion38 = str.includes('🎼4/4')
    str = str.replace('🎼2/4', '🎼3/4')
    str = str.replace('🎼3/4', '🎼4/4')
    const [_, payloadStart] = str.split('🎼4/4|')
    if (!payloadStart)
        if (throws) throw new Error(geti18nString('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(geti18nString('payload_incomplete'))
        else return null
    const [AESKeyEncrypted, iv, encryptedText, signature, publicShared, ...extra] = payload.split('|')
    if (!(AESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error(geti18nString('payload_bad'))
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    if (isVersion38) {
        if (!signature) throw new Error(geti18nString('payload_bad'))
        return {
            AESKeyEncrypted,
            iv,
            encryptedText,
            signature,
            version: -38,
            sharedPublic: !!publicShared,
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
        if (throws) throw new Error(geti18nString('payload_throw_in_alpha41'))
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
            if (GetContext() === 'content') return [getActivatedUI().payloadDecoder]
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
        if (throws) throw new TypeError(geti18nString('service_unknown_payload'))
        else return null
    if (throws) throw new TypeError(geti18nString('payload_not_found'))
    else return null
}

export function constructAlpha40(data: PayloadAlpha40_Or_Alpha39, encoder: Encoder) {
    return encoder(`🎼2/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`)
}

export function constructAlpha39(data: PayloadAlpha40_Or_Alpha39, encoder: Encoder) {
    return encoder(`🎼3/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`)
}

export function constructAlpha38(data: PayloadAlpha38, encoder: Encoder) {
    return encoder(
        `🎼4/4|${data.AESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}${
            data.sharedPublic ? '|t' : ''
        }:||`,
    )
}
