import type { SocialNetwork } from '../../social-network'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { i18n } from '../i18n-next'
import { Result, Ok, Err } from 'ts-results'
import { Identifier, ProfileIdentifier } from '../../database/type'
import { decodeTextPayloadUI, encodeTextPayloadUI } from '../../social-network/utils/text-payload-ui'

import type { Payload, PayloadAlpha38 } from '@masknet/shared'
export type {
    Payload,
    PayloadAlpha38,
    PayloadAlpha40_Or_Alpha39,
    PayloadLatest,
    PayloadVersions as Versions,
} from '@masknet/shared'

/**
 * Detect if there is version -40, -39 or -38 payload
 */
function deconstructAlpha40_Or_Alpha39_Or_Alpha38(str: string, throws = false): Payload | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier:||
    // ? if publicShared is true, that means AESKeyEncrypted is shared with public
    // ? "1" treated as true, "0" or not defined treated as false
    // ? authorIdentifier is encoded as `${network}/${id}`
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
            authorUserID: Result.wrap(() =>
                Identifier.fromString('person:' + atob(authorID), ProfileIdentifier).unwrap(),
            ).unwrapOr(undefined),
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
 * @type Decoder - defines decoder. if null, auto select decoder.
 */
type Decoder = SocialNetwork.PayloadEncoding['decoder'] | null
type Encoder = SocialNetwork.PayloadEncoding['encoder']

export function deconstructPayload(str: string, networkDecoder?: Decoder): Result<Payload, TypeError> {
    if (!networkDecoder) {
        networkDecoder = isEnvironment(Environment.ContentScript) ? decodeTextPayloadUI : (x) => [x]
    }

    for (const versionDecoder of versions) {
        const results = networkDecoder(str)
        for (const result of results) {
            if (!result) continue
            const payload = versionDecoder(result, false)
            if (payload) return Ok(payload)
        }
    }
    if (str.includes('🎼') && str.includes(':||')) return Err(new TypeError(i18n.t('service_unknown_payload')))
    return Err(new TypeError(i18n.t('payload_not_found')))
}

export function constructAlpha38(data: PayloadAlpha38, encoder?: Encoder) {
    if (!encoder) {
        encoder = isEnvironment(Environment.ContentScript) ? encodeTextPayloadUI : (x) => x
    }
    const userID = data.authorUserID?.toText().replace('person:', '') || ''
    const fields = [
        data.AESKeyEncrypted,
        data.iv,
        data.encryptedText,
        data.signature,
        data.authorPublicKey,
        data.sharedPublic ? '1' : '0',
        userID.includes('|') ? undefined : btoa(userID),
    ]
    return encoder(`🎼4/4|${fields.join('|')}:||`)
}
