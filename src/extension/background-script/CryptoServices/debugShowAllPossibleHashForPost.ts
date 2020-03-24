import { PostIVIdentifier } from '../../../database/type'
import { hashPostSalt, hashCryptoKey, hashCryptoKeyUnstable } from '../../../network/gun/version.2/hash'
import { queryProfilesWithQuery, queryPublicKey } from '../../../database'
import { getNetworkWorker } from '../../../social-network/worker'

export async function debugShowAllPossibleHashForPost(post: PostIVIdentifier, payloadVersion: -38 | -39 | -40) {
    const friends = await queryProfilesWithQuery((x) => x.identifier.network === post.network)
    return Promise.all(
        friends
            .filter((x) => x.linkedPersona)
            .map(
                async (x) =>
                    [
                        x.identifier.toText(),
                        (await hashPostSalt(post.postIV, getNetworkWorker(post).gunNetworkHint)) +
                            '-' +
                            (await (payloadVersion <= -39 ? hashCryptoKeyUnstable : hashCryptoKey)(
                                (await queryPublicKey(x.identifier))!,
                            )),
                        x.linkedPersona?.fingerprint!,
                    ] as [string, string, string],
            ),
    )
}
