/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import type { SocialNetwork } from '../../social-network'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { i18n } from '../../../shared-ui/locales_legacy'
import { Result, Ok, Err } from 'ts-results'
import { decodeTextPayloadUI } from '../../social-network/utils/text-payload-ui'

import { Payload, ProfileIdentifier } from '@masknet/shared-base'

/**
 * Detect if there is version -40, -39 or -38 payload
 */
function deconstructAlpha40_Or_Alpha39_Or_Alpha38(input: string, throws = false): Payload | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier:||
    // ? if publicShared is true, that means AESKeyEncrypted is shared with public
    // ? "1" treated as true, "0" or not defined treated as false
    // ? authorIdentifier is encoded as `${network}/${id}`
    const isVersion40 = input.includes('\u{1F3BC}2/4')
    const isVersion39 = input.includes('\u{1F3BC}3/4')
    const isVersion38 = input.includes('\u{1F3BC}4/4')
    input = input.replace('\u{1F3BC}2/4', '\u{1F3BC}3/4')
    input = input.replace('\u{1F3BC}3/4', '\u{1F3BC}4/4')
    const [_, payloadStart] = input.split('\u{1F3BC}4/4|')
    if (!payloadStart)
        if (throws) throw new Error(i18n.t('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(i18n.t('payload_incomplete'))
        else return null
    const [AESKeyEncrypted, iv, encryptedText, signature, ...optional] = payload.split('|')
    const [authorPublicKey, publicShared, authorID, ...extra] = optional
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
            authorUserID: ProfileIdentifier.from('person:' + atob(authorID)).unwrapOr(undefined),
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

function deconstructAlpha41(input: string, throws = false): null | never {
    // 🎼1/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    if (input.includes('\u{1F3BC}1/4') && input.includes(':||'))
        if (throws) throw new Error(i18n.t('payload_throw_in_alpha41'))
        else return null
    return null
}

const versions = new Set([deconstructAlpha40_Or_Alpha39_Or_Alpha38, deconstructAlpha41])

/**
 * @type Decoder - defines decoder. if null, auto select decoder.
 */
type Decoder = SocialNetwork.PayloadEncoding['decoder'] | null

export function deconstructPayload(input: string, networkDecoder?: Decoder): Result<Payload, TypeError> {
    networkDecoder ??= isEnvironment(Environment.ContentScript) ? decodeTextPayloadUI : (x) => [x]

    for (const versionDecoder of versions) {
        const results = networkDecoder(input)
        for (const result of results) {
            if (!result) continue
            const payload = versionDecoder(result, false)
            if (payload) return Ok(payload)
        }
    }
    if (input.includes('\u{1F3BC}') && input.includes(':||'))
        return Err(new TypeError(i18n.t('service_unknown_payload')))
    return Err(new TypeError(i18n.t('payload_not_found')))
}
