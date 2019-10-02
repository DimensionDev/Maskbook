import { PostIVIdentifier } from '../../../database/type'
import { queryPeopleDB } from '../../../database/people'
import { hashPostSalt, hashCryptoKey } from '../../../network/gun/version.2/hash'

export async function debugShowAllPossibleHashForPost(post: PostIVIdentifier) {
    const friends = await queryPeopleDB(x => x.network === post.network)
    return Promise.all(
        friends
            .filter(x => x.publicKey)
            .map(
                async x =>
                    [
                        x.identifier.toText(),
                        (await hashPostSalt(post.postIV)) + '-' + (await hashCryptoKey(x.publicKey!, true)),
                    ] as [string, string],
            ),
    )
}
