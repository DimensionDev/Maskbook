import {
    appendEncryptionTarget,
    EC_Key,
    EC_KeyCurveEnum,
    SocialNetworkEnum,
    SupportedPayloadVersions,
} from '@masknet/encryption'
import type { EC_Public_CryptoKey, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { deriveAESByECDH, queryPublicKey } from '../../database/persona/helper'
import { updatePostDB, queryPostDB } from '../../database/post'
import { publishPostAESKey_version37, publishPostAESKey_version39Or38 } from '../../network/gun/encryption/queryPostKey'
import { getPostKeyCache } from './decryption'

export async function appendShareTarget(
    version: SupportedPayloadVersions,
    post: PostIVIdentifier,
    target: ProfileIdentifier[],
    whoAmI: ProfileIdentifier,
    network: SocialNetworkEnum,
): Promise<void> {
    if (version === -39 || version === -40) throw new TypeError('invalid version')
    const key = await getPostKeyCache(post)
    const postRec = await queryPostDB(post)
    const postBy = postRec?.encryptBy || postRec?.postBy || whoAmI

    if (!key) throw new Error('No post key found')

    const e2e = await appendEncryptionTarget(
        {
            target,
            iv: post.toIV(),
            postAESKey: key,
            version,
        },
        {
            async deriveAESKey(pub) {
                const result = Array.from((await deriveAESByECDH(pub, postBy)).values())
                if (result.length === 0) throw new Error('No key found')
                return result[0]
            },
            queryPublicKey: (id) =>
                queryPublicKey(id).then((key): EC_Key<EC_Public_CryptoKey> | null =>
                    key ? { algr: EC_KeyCurveEnum.secp256k1, key } : null,
                ),
        },
    )

    if (version === -38) {
        publishPostAESKey_version39Or38(-38, post.toIV(), network, e2e)
    } else {
        publishPostAESKey_version37(post.toIV(), network, e2e)
    }

    updatePostDB(
        {
            identifier: post,
            recipients: new Map(target.map((identifier): [ProfileIdentifier, Date] => [identifier, new Date()])),
        },
        'append',
    )
}
