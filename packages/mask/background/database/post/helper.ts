import type { AESCryptoKey, PostIVIdentifier } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../utils-pure'
import { createTransaction } from '../utils/openDB'
import { PostDBAccess, queryPostDB, createPostDB, updatePostDB, PostRecord } from './index'

export async function savePostKeyToDB(
    id: PostIVIdentifier,
    key: AESCryptoKey,
    extraInfo: Omit<PostRecord, 'identifier' | 'foundAt'>,
): Promise<void> {
    const jwk = await CryptoKeyToJsonWebKey(key)
    {
        const t = createTransaction(await PostDBAccess(), 'readwrite')('post')
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
    }
}
