import { PostIVIdentifier } from '../../../database/type'
import { queryPeopleDB } from '../../../database/people'
import { hashPostSalt, hashCryptoKey, hashCryptoKeyUnstable } from '../../../network/gun/version.2/hash'

export async function debugShowAllPossibleHashForPost(post: PostIVIdentifier, payloadVersion: -38 | -39 | -40) {
    const friends = await queryPeopleDB(x => x.network === post.network)
    return Promise.all(
        friends
            .filter(x => x.publicKey)
            .map(
                async x =>
                    [
                        x.identifier.toText(),
                        (await hashPostSalt(post.postIV)) +
                            '-' +
                            (await (payloadVersion >= -38 ? hashCryptoKey : hashCryptoKeyUnstable)(x.publicKey!)),
                    ] as [string, string],
            ),
    )
}
