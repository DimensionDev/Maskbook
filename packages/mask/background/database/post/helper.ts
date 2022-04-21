import type { AESCryptoKey, PostIVIdentifier } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure'
import { withPostDBTransaction, queryPostDB, createPostDB, updatePostDB, PostRecord } from './index'

export async function savePostKeyToDB(
    id: PostIVIdentifier,
    key: AESCryptoKey,
    extraInfo: Omit<PostRecord, 'identifier' | 'foundAt' | 'postCryptoKey'>,
): Promise<void> {
    const jwk = await CryptoKeyToJsonWebKey(key)
    await withPostDBTransaction(async (t) => {
        const post = await queryPostDB(id, t)
        if (!post) {
            await createPostDB(
                {
                    identifier: id,
                    postCryptoKey: jwk,
                    foundAt: new Date(),
                    ...extraInfo,
                },
                t,
            )
        } else {
            await updatePostDB({ ...post, postCryptoKey: jwk }, 'override', t)
        }
    })
}
