import {
    PostRecord,
    recipientsToNext,
    RecipientReason,
    recipientsFromNext,
    RecipientDetailNext,
} from '../../../../../database/post'
import { BackupJSONFileLatest } from '../latest'
import { RecipientReasonJSON } from '../version-2'
import { Identifier, GroupIdentifier, PostIVIdentifier, ProfileIdentifier } from '../../../../../database/type'
import { IdentifierMap } from '../../../../../database/IdentifierMap'

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
        recipients: Array.from(recipientsToNext(post.recipients)).map(([identifier, detail]): [
            string,
            { reason: RecipientReasonJSON[] },
        ] => [
            identifier.toText(),
            {
                reason: Array.from(detail.reason).map<RecipientReasonJSON>(RecipientReasonToJSON),
            },
        ]),
    }
}

export function PostRecordFromJSONFormat(
    post: BackupJSONFileLatest['posts'][0],
    keyMap: WeakMap<JsonWebKey, CryptoKey>,
): PostRecord {
    return {
        postCryptoKey: post.postCryptoKey ? keyMap.get(post.postCryptoKey) : undefined,
        foundAt: new Date(post.foundAt),
        identifier: Identifier.fromString(post.identifier, PostIVIdentifier).unwrap('Cast failed'),
        postBy: Identifier.fromString(post.postBy, ProfileIdentifier).unwrap('Cast failed'),
        recipientGroups: post.recipientGroups.map(x => Identifier.fromString(x, GroupIdentifier).unwrap('Cast failed')),
        recipients: recipientsFromNext(
            new IdentifierMap<ProfileIdentifier, RecipientDetailNext>(
                new Map<string, RecipientDetailNext>(
                    post.recipients.map(([x, y]) => [
                        x,
                        { reason: new Set(y.reason.map(RecipientReasonFromJSON)) } as RecipientDetailNext,
                    ]),
                ),
            ),
        ),
    }
}

function RecipientReasonToJSON(y: RecipientReason): RecipientReasonJSON {
    if (y.type === 'direct') return { at: y.at.getTime(), type: y.type }
    else if (y.type === 'group') return { at: y.at.getTime(), group: y.group.toText(), type: y.type }
    const x: never = y
    throw new Error('Unreachable case')
}
function RecipientReasonFromJSON(y: RecipientReasonJSON): RecipientReason {
    if (y.type === 'direct') return { at: new Date(y.at), type: y.type }
    else if (y.type === 'group')
        return {
            type: 'group',
            at: new Date(y.at),
            group: Identifier.fromString(y.group, GroupIdentifier).unwrap('Cast failed'),
        }
    const x: never = y
    throw new Error('Unreachable case')
}
