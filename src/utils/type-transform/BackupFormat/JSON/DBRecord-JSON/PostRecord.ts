import { PostRecord } from '../../../../../database/post'
import { BackupJSONFileLatest } from '../latest'
import { RecipientReasonJSON } from '../version-2'

export function PostRecordToJSONFormat(
    post: PostRecord,
    keyMap: WeakMap<CryptoKey, JsonWebKey>,
): BackupJSONFileLatest['posts'][0] {
    type R = BackupJSONFileLatest['posts'][0]['recipients']
    return {
        postCryptoKey: post.postCryptoKey ? keyMap.get(post.postCryptoKey) : undefined,
        foundAt: post.foundAt.getTime(),
        identifier: post.identifier.toText(),
        postBy: post.postBy.toText(),
        recipientGroups: post.recipientGroups.map(x => x.toText()),
        recipients: Object.fromEntries(
            Object.entries(post.recipients).map(([identifier, detail]): [string, { reason: RecipientReasonJSON[] }] => [
                identifier,
                {
                    reason: detail.reason.map<RecipientReasonJSON>(y => {
                        if (y.type === 'direct') return { ...y, at: y.at.getTime() }
                        else if (y.type === 'group') return { ...y, at: y.at.getTime(), group: y.group.toText() }
                        const x: never = y
                        throw new Error('Unreachable case')
                    }),
                },
            ]),
        ),
    }
}
