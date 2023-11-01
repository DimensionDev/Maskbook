import { appendEncryptionTarget, type EncryptPayloadNetwork, type SupportedPayloadVersions } from '@masknet/encryption'
import type { PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { deriveAESByECDH } from '../../database/persona/helper.js'
import { updatePostDB, queryPostDB } from '../../database/post/index.js'
import { publishPostAESKey_version37, publishPostAESKey_version39Or38 } from '../../network/queryPostKey.js'
import { getPostKeyCache } from './decryption.js'
import { prepareEncryptTarget, type EncryptTargetE2EFromProfileIdentifier } from './encryption.js'

export async function appendShareTarget(
    version: SupportedPayloadVersions,
    post: PostIVIdentifier,
    target: EncryptTargetE2EFromProfileIdentifier['target'],
    whoAmI: ProfileIdentifier,
    network: EncryptPayloadNetwork,
): Promise<void> {
    if (version === -39 || version === -40) throw new TypeError('invalid version')
    const key = await getPostKeyCache(post)
    const postRec = await queryPostDB(post)
    const postBy = postRec?.encryptBy || postRec?.postBy || whoAmI

    const [keyMap, { target: convertedTarget }] = await prepareEncryptTarget({ type: 'E2E', target })

    if (!key) throw new Error('No post key found')
    const e2e = await appendEncryptionTarget(
        {
            target: convertedTarget,
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
        },
    )

    if (version === -38) {
        publishPostAESKey_version39Or38(-38, post.toIV(), network, e2e)
    } else {
        publishPostAESKey_version37(post.toIV(), network, e2e)
    }

    {
        const recipients = new Map<ProfileIdentifier, Date>()
        for (const [, value] of keyMap) recipients.set(value, new Date())
        updatePostDB({ identifier: post, recipients }, 'append')
    }
}
