import type { EC_Public_CryptoKey, ProfileIdentifier } from '@masknet/shared-base'
import { isTypedMessageText, SerializableTypedMessages, TypedMessageText } from '@masknet/typed-message'
import {
    EC_Key,
    EC_KeyCurveEnum,
    encrypt,
    EncryptionResultE2EMap,
    EncryptTargetE2E,
    EncryptTargetPublic,
} from '@masknet/encryption'
import { encryptByLocalKey, deriveAESByECDH, queryPublicKey } from '../../database/persona/helper'
import { savePostKeyToDB } from '../../database/post/helper'
import { noop } from 'lodash-unified'
import { queryProfileDB } from '../../database/persona/db'
import { publishPostAESKey_version39Or38 } from '../../network/gun/encryption/queryPostKey'

export async function encryptTo(
    content: SerializableTypedMessages,
    target: EncryptTargetPublic | EncryptTargetE2E,
    whoAmI: ProfileIdentifier | undefined,
    IdentifierNetwork: string,
): Promise<string> {
    // always use identifier network from ProfileIdentifier if possible.
    if (whoAmI) IdentifierNetwork = whoAmI.network
    const { identifier, output, postKey, e2e } = await encrypt(
        {
            network: IdentifierNetwork,
            author: whoAmI,
            message: content,
            target,
            version: -38,
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
            queryPublicKey: (id) =>
                queryPublicKey(id).then((key): EC_Key<EC_Public_CryptoKey> | null =>
                    key ? { algr: EC_KeyCurveEnum.secp256k1, key } : null,
                ),
        },
    )

    ;(async () => {
        const profile = whoAmI ? await queryProfileDB(whoAmI).catch(noop) : null
        const usingPersona = profile?.linkedPersona
        return savePostKeyToDB(identifier, postKey, {
            postBy: whoAmI,
            recipients: target.type === 'public' ? 'everyone' : e2eMapToRecipientDetails(e2e!),
            encryptBy: usingPersona,
            ...collectInterestedMeta(content),
        })
    })().catch((error) => console.error('[@masknet/encryption] Failed to save post key to DB', error))

    if (target.type === 'E2E') {
        publishPostAESKey_version39Or38(-38, identifier.toIV(), IdentifierNetwork, e2e!)
    }
    if (typeof output !== 'string') throw new Error('version -37 is not enabled yet!')
    return output
}

function e2eMapToRecipientDetails(input: EncryptionResultE2EMap): Map<ProfileIdentifier, Date> {
    const result = new Map<ProfileIdentifier, Date>()
    for (const [identifier] of input) {
        result.set(identifier, new Date())
    }
    return result
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
