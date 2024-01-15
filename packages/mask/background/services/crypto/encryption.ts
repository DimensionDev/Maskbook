import type { EC_Public_CryptoKey, PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { isTypedMessageText, type SerializableTypedMessages, type TypedMessageText } from '@masknet/typed-message'
import {
    type EC_Key,
    EC_KeyCurve,
    encrypt,
    type EncryptionResultE2EMap,
    type EncryptTargetE2E,
    type EncryptTargetPublic,
    type EncryptPayloadNetwork,
    encryptPayloadNetworkToDomain,
} from '@masknet/encryption'
import { encryptByLocalKey, deriveAESByECDH, queryPublicKey } from '../../database/persona/helper.js'
import { savePostKeyToDB } from '../../database/post/helper.js'
import { noop } from 'lodash-es'
import { queryProfileDB } from '../../database/persona/db.js'
import { publishPostAESKey_version39Or38, publishPostAESKey_version37 } from '../../network/queryPostKey.js'
import { None, Some } from 'ts-results-es'

export interface EncryptTargetE2EFromProfileIdentifier {
    type: 'E2E'
    target: ReadonlyArray<{ profile: ProfileIdentifier; persona?: PersonaIdentifier }>
}
export async function encryptTo(
    version: -37 | -38,
    content: SerializableTypedMessages,
    target: EncryptTargetPublic | EncryptTargetE2EFromProfileIdentifier,
    whoAmI: ProfileIdentifier | undefined,
    network: EncryptPayloadNetwork,
): Promise<string | Uint8Array> {
    const [keyMap, convertedTarget] = await prepareEncryptTarget(target)

    const authorPublicKey = whoAmI ? await queryPublicKey(whoAmI).catch(noop) : undefined
    const { identifier, output, postKey, e2e } = await encrypt(
        {
            network: whoAmI?.network || encryptPayloadNetworkToDomain(network),
            author: whoAmI ? Some(whoAmI) : None,
            authorPublicKey:
                authorPublicKey ?
                    Some({ algr: EC_KeyCurve.secp256k1, key: authorPublicKey } satisfies EC_Key<EC_Public_CryptoKey>)
                :   None,
            message: content,
            target: convertedTarget,
            version,
        },
        {
            async deriveAESKey(pub) {
                const result = Array.from((await deriveAESByECDH(pub, whoAmI)).values())
                if (result.length === 0) throw new Error('No key found')
                return result[0]
            },
            encryptByLocalKey: async (content, iv) => {
                if (!whoAmI) throw new Error('No Profile found')
                return encryptByLocalKey(whoAmI, content, iv)
            },
        },
    )
    ;(async () => {
        const profile = whoAmI ? await queryProfileDB(whoAmI).catch(noop) : null
        const usingPersona = profile?.linkedPersona
        return savePostKeyToDB(identifier, postKey, {
            postBy: whoAmI,
            recipients: target.type === 'public' ? 'everyone' : e2eMapToRecipientDetails(keyMap!, e2e!),
            encryptBy: usingPersona,
            ...collectInterestedMeta(content),
        })
    })().catch((error) => console.error('[@masknet/encryption] Failed to save post key to DB', error))

    if (target.type === 'E2E') {
        if (version === -37) {
            publishPostAESKey_version37(identifier.toIV(), network, e2e!)
        } else {
            publishPostAESKey_version39Or38(-38, identifier.toIV(), network, e2e!)
        }
    }
    return output
}

function e2eMapToRecipientDetails(
    keyMap: Map<EC_Public_CryptoKey, ProfileIdentifier>,
    input: EncryptionResultE2EMap,
): Map<ProfileIdentifier, Date> {
    const result = new Map<ProfileIdentifier, Date>()
    for (const [key] of input) {
        const identifier = keyMap.get(key.key)
        if (!identifier) continue
        result.set(identifier, new Date())
    }
    return result
}

/** @internal */
export function prepareEncryptTarget(
    target: EncryptTargetE2EFromProfileIdentifier,
): Promise<readonly [key_map: Map<EC_Public_CryptoKey, ProfileIdentifier>, EncryptTargetE2E]>
export function prepareEncryptTarget(target: EncryptTargetPublic): Promise<readonly [key_map: null, EncryptTargetE2E]>
export function prepareEncryptTarget(
    target: EncryptTargetPublic | EncryptTargetE2EFromProfileIdentifier,
): Promise<
    readonly [key_map: Map<EC_Public_CryptoKey, ProfileIdentifier> | null, EncryptTargetPublic | EncryptTargetE2E]
>
export async function prepareEncryptTarget(
    target: EncryptTargetPublic | EncryptTargetE2EFromProfileIdentifier,
): Promise<
    readonly [key_map: Map<EC_Public_CryptoKey, ProfileIdentifier> | null, EncryptTargetPublic | EncryptTargetE2E]
> {
    if (target.type === 'public') return [null, target] as const
    const key_map = new Map<EC_Public_CryptoKey, ProfileIdentifier>()
    const map: Array<EC_Key<EC_Public_CryptoKey>> = []

    await Promise.allSettled(
        target.target.map(async (id) => {
            const key = (await id.persona?.toCryptoKey('derive')) || (await queryPublicKey(id.profile))
            if (!key) {
                console.error('No publicKey found for profile', id.profile.toText())
                return
            }
            map.push({ algr: EC_KeyCurve.secp256k1, key })
            key_map.set(key, id.profile)
        }),
    )

    return [key_map, { type: 'E2E', target: map } satisfies EncryptTargetE2E] as const
}

function collectInterestedMeta(content: SerializableTypedMessages) {
    if (isTypedMessageText(content)) return { summary: getSummary(content), meta: content.meta }
    return {}
}

const SUMMARY_MAX_LENGTH = 40
function getSummary(content: TypedMessageText) {
    let result = ''
    const sliceLength = content.content.length > SUMMARY_MAX_LENGTH ? SUMMARY_MAX_LENGTH + 1 : SUMMARY_MAX_LENGTH

    // UTF-8 aware summary
    if (Intl.Segmenter) {
        // it seems like using "en" can also split the word correctly.
        const seg = new Intl.Segmenter('en')
        for (const word of seg.segment(content.content)) {
            if (result.length >= sliceLength) break
            result += word.segment
        }
    } else {
        result = content.content.slice(0, sliceLength)
    }
    return result
}
