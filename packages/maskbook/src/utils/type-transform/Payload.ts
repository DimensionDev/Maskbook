import type { SocialNetworkWorkerAndUI } from '../../social-network/shared'
import { isNil } from 'lodash-es'
import { definedSocialNetworkWorkers } from '../../social-network/worker'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { safeGetActiveUI } from '../safeRequire'
import { i18n } from '../i18n-next'
import { Result, Ok, Err } from 'ts-results'
import { Identifier, ProfileIdentifier } from '../../database/type'

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
    /** @deprecated but don't remove it cause it will break */
    signature: string
    authorPublicKey?: string
    authorUserID?: ProfileIdentifier
    sharedPublic?: boolean
}

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
type Decoder = SocialNetworkWorkerAndUI['payloadDecoder'] | null
type Encoder = SocialNetworkWorkerAndUI['payloadEncoder']

export function deconstructPayload(str: string, decoder: Decoder): Result<Payload, TypeError> {
    const decoders = (() => {
        if (isNil(decoder)) {
            if (isEnvironment(Environment.ContentScript)) {
                return [safeGetActiveUI().payloadDecoder]
            }
            return Array.from(definedSocialNetworkWorkers).map((x) => x.payloadDecoder)
        }
        return [decoder]
    })()

    if (decoders.length === 0) decoders.push((x) => x)

    for (const versionDecoder of versions) {
        for (const networkDecoder of decoders) {
            if (isNil(networkDecoder(str))) continue
            const result = versionDecoder(networkDecoder(str)!, false)
            if (!isNil(result)) return Ok(result)
        }
    }
    if (str.includes('🎼') && str.includes(':||')) return Err(new TypeError(i18n.t('service_unknown_payload')))
    return Err(new TypeError(i18n.t('payload_not_found')))
}

export function constructAlpha38(data: PayloadAlpha38, encoder: Encoder) {
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

/**
 * The string part is in the front of the payload.
 * The number part is used in the database.
 */
export enum Versions {
    '2/4' = -40,
    '3/4' = -39,
    '4/4' = -38,
}
