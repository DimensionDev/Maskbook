import { geti18nString } from '../i18n'
import { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { defaults, isNil } from 'lodash-es'
import { definedSocialNetworkWorkers } from '../../social-network/worker'

export type Payload = PayloadAlpha40_Or_Alpha39

interface PayloadAlpha40_Or_Alpha39 {
    version: -40 | -39
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}

/**
 * Detect if there is version -40 or -39 payload
 */
function deconstructAlpha40_Or_Alpha39(str: string, throws = false): Payload | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    const isVersion39 = str.includes('🎼3/4')
    str = str.replace('🎼2/4', '🎼3/4')
    const [_, payloadStart] = str.split('🎼3/4|')
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

const versions = new Set([deconstructAlpha40_Or_Alpha39, deconstructAlpha41])

/**
 * @type Decoder    defines decoder. if null, auto select decoder.
 */
type Decoder = SocialNetworkWorkerAndUI['payloadDecoder'] | null
type Encoder = SocialNetworkWorkerAndUI['payloadEncoder']

export function deconstructPayload(str: string, decoder: Decoder, opts?: { throws: false }): Payload | null
export function deconstructPayload(str: string, decoder: Decoder, opts?: { throws: true }): Payload
export function deconstructPayload(
    str: string,
    decoder: Decoder,
    opts: { throws?: boolean } = { throws: false },
): Payload | null {
    defaults(opts, {
        throws: false,
    })

    const decoders = (() => {
        if (isNil(decoder)) {
            const sto = []
            for (const v of definedSocialNetworkWorkers) {
                sto.push(v.payloadDecoder)
            }
            return sto
        }
        return [decoder]
    })()

    for (const versionDecoder of versions) {
        for (const networkDecoder of decoders) {
            if (isNil(networkDecoder(str))) continue
            const result = versionDecoder(networkDecoder(str)!, false)
            if (!isNil(result)) {
                return result
            }
        }
    }
    if (str.includes('🎼') && str.includes(':||'))
        if (opts.throws) throw new TypeError(geti18nString('service_unknown_payload'))
        else return null
    if (opts.throws) throw new TypeError(geti18nString('payload_not_found'))
    else return null
}

export function constructAlpha40(data: Payload, encoder: Encoder) {
    return encoder(`🎼2/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`)
}

export function constructAlpha39(data: Payload, encoder: Encoder) {
    return encoder(`🎼3/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`)
}
