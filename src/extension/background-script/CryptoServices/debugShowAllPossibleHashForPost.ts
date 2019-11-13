import { PostIVIdentifier } from '../../../database/type'
import { hashPostSalt, hashCryptoKey, hashCryptoKeyUnstable } from '../../../network/gun/version.2/hash'
import { getActivatedUI } from '../../../social-network/ui'
import { queryProfilesWithQuery, queryPublicKey } from '../../../database'

export async function debugShowAllPossibleHashForPost(post: PostIVIdentifier, payloadVersion: -38 | -39 | -40) {
    const friends = await queryProfilesWithQuery(x => x.identifier.network === post.network)
    return Promise.all(
        friends
            .filter(x => x.linkedPersona)
            .map(
                async x =>
                    [
                        x.identifier.toText(),
                        (await hashPostSalt(post.postIV, getActivatedUI().gunNetworkHint)) +
                            '-' +
                            (await (payloadVersion <= -39 ? hashCryptoKeyUnstable : hashCryptoKey)(
                                (await queryPublicKey(x.identifier))!,
                            )),
                        x.linkedPersona?.fingerprint!,
                    ] as [string, string, string],
            ),
    )
}
