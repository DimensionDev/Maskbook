import type { PostRecord, RecipientDetail, RecipientReason } from '../../../../../database/post'
import type { BackupJSONFileLatest } from '../latest'
import type { RecipientReasonJSON } from '../version-2'
import {
    ECKeyIdentifier,
    GroupIdentifier,
    Identifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '../../../../../database/type'
import { IdentifierMap } from '../../../../../database/IdentifierMap'
import { encodeArrayBuffer, decodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import { encode, decode } from '@msgpack/msgpack'
import type { TypedMessage } from '@masknet/shared-base'

export function PostRecordToJSONFormat(post: PostRecord): BackupJSONFileLatest['posts'][0] {
    return {
        postCryptoKey: post.postCryptoKey,
        foundAt: post.foundAt.getTime(),
        identifier: post.identifier.toText(),
        postBy: post.postBy.toText(),
        recipientGroups: [],
        recipients:
            post.recipients === 'everyone'
                ? 'everyone'
                : Array.from(post.recipients).map(
                      ([identifier, detail]): [string, { reason: RecipientReasonJSON[] }] => [
                          identifier.toText(),
                          {
                              reason: Array.from(detail.reason).map<RecipientReasonJSON>(RecipientReasonToJSON),
                          },
                      ],
                  ),
        encryptBy: post.encryptBy?.toText(),
        interestedMeta: MetaToJson(post.interestedMeta),
        summary: post.summary,
        url: post.url,
    }
}

export function PostRecordFromJSONFormat(post: BackupJSONFileLatest['posts'][0]): PostRecord {
    return {
        postCryptoKey: post.postCryptoKey,
        foundAt: new Date(post.foundAt),
        identifier: Identifier.fromString(post.identifier, PostIVIdentifier).unwrap(),
        postBy: Identifier.fromString(post.postBy, ProfileIdentifier).unwrap(),
        recipients:
            post.recipients === 'everyone'
                ? 'everyone'
                : new IdentifierMap<ProfileIdentifier, RecipientDetail>(
                      new Map<string, RecipientDetail>(
                          post.recipients.map(([x, y]) => [
                              x,
                              { reason: y.reason.map(RecipientReasonFromJSON) } as RecipientDetail,
                          ]),
                      ),
                  ),
        encryptBy: post.encryptBy ? Identifier.fromString(post.encryptBy, ECKeyIdentifier).unwrap() : undefined,
        interestedMeta: MetaFromJson(post.interestedMeta),
        summary: post.summary,
        url: post.url,
    }
}

function RecipientReasonToJSON(y: RecipientReason): RecipientReasonJSON {
    if (y.type === 'direct' || y.type === 'auto-share')
        return { at: y.at.getTime(), type: y.type } as RecipientReasonJSON
    else if (y.type === 'group') return { at: y.at.getTime(), group: y.group.toText(), type: y.type }
    return unreachable(y)
}
function RecipientReasonFromJSON(y: RecipientReasonJSON): RecipientReason {
    if (y.type === 'direct' || y.type === 'auto-share') return { at: new Date(y.at), type: y.type } as RecipientReason
    else if (y.type === 'group')
        return {
            type: 'group',
            at: new Date(y.at),
            group: Identifier.fromString(y.group, GroupIdentifier).unwrap(),
        }
    return unreachable(y)
}
function MetaToJson(meta: undefined | TypedMessage['meta']): undefined | string {
    if (!meta) return undefined
    const obj = Object.fromEntries(meta)
    return encodeArrayBuffer(encode(obj))
}
function MetaFromJson(meta: string | undefined): undefined | TypedMessage['meta'] {
    if (!meta) return undefined
    const raw = decode(decodeArrayBuffer(meta))
    if (typeof raw !== 'object' || !raw) return undefined
    return new Map(Object.entries(raw))
}
