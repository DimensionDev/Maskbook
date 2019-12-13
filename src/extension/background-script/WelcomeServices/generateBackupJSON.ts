import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import {
    queryPersonasDB,
    PersonaRecord,
    LinkedProfileDetails,
    queryProfilesDB,
    ProfileRecord,
} from '../../../database/Persona/Persona.db'
import { CryptoKeyToJsonWebKey } from '../../../utils/type-transform/CryptoKey-JsonWebKey'
import { queryUserGroupsDatabase, GroupRecord } from '../../../database/group'
import { queryPostsDB, PostRecord } from '../../../database/post'
import { RecipientReasonJSON } from '../../../utils/type-transform/BackupFormat/JSON/version-2'

export async function generateBackupJSON(): Promise<BackupJSONFileLatest> {
    const personas: BackupJSONFileLatest['personas'] = []
    const posts: BackupJSONFileLatest['posts'] = []
    const profiles: BackupJSONFileLatest['profiles'] = []
    const userGroups: BackupJSONFileLatest['userGroups'] = []

    const map = new WeakMap<CryptoKey, JsonWebKey>()
    {
        const data = await queryPersonasDB(() => true)
        await Promise.all(
            data.map(async x => x.localKey && map.set(x.localKey, await CryptoKeyToJsonWebKey(x.localKey))),
        )
        data.forEach(x => personas.push(PersonaRecordToJSONFormat(x, map)))
    }

    {
        const data = await queryProfilesDB(() => true)
        await Promise.all(
            data.map(async x => x.localKey && map.set(x.localKey, await CryptoKeyToJsonWebKey(x.localKey))),
        )
        data.forEach(x => profiles.push(ProfileRecordToJSONFormat(x, map)))
    }

    {
        const data = await queryUserGroupsDatabase(() => true)
        data.forEach(x => userGroups.push(GroupRecordToJSONFormat(x)))
    }

    {
        const data = await queryPostsDB(() => true)
        await Promise.all(
            data.map(
                async x => x.postCryptoKey && map.set(x.postCryptoKey, await CryptoKeyToJsonWebKey(x.postCryptoKey)),
            ),
        )
        data.forEach(x => posts.push(PostRecordToJSONFormat(x, map)))
    }

    return {
        _meta_: {
            createdAt: Date.now(),
            maskbookVersion: browser.runtime.getManifest().version,
            version: 2,
            type: 'maskbook-backup',
        },
        grantedHostPermissions: (await browser.permissions.getAll()).origins || [],
        personas,
        posts,
        profiles,
        userGroups,
    }
}

export function PersonaRecordToJSONFormat(
    persona: PersonaRecord,
    localKeyMap: WeakMap<CryptoKey, JsonWebKey>,
): BackupJSONFileLatest['personas'][0] {
    return {
        createdAt: persona.createdAt.getTime(),
        updatedAt: persona.updatedAt.getTime(),
        identifier: persona.identifier.toText(),
        publicKey: persona.publicKey,
        privateKey: persona.privateKey,
        nickname: persona.nickname,
        mnemonic: persona.mnemonic,
        localKey: persona.localKey ? localKeyMap.get(persona.localKey) : undefined,
        linkedProfiles: Array.from(persona.linkedProfiles).reduce(
            (last, [id, detail]) => ({ ...last, [id.toText()]: detail }),
            {} as Record<string, LinkedProfileDetails>,
        ),
    }
}

export function ProfileRecordToJSONFormat(
    profile: ProfileRecord,
    localKeyMap: WeakMap<CryptoKey, JsonWebKey>,
): BackupJSONFileLatest['profiles'][0] {
    return {
        createdAt: profile.createdAt.getTime(),
        updatedAt: profile.updatedAt.getTime(),
        identifier: profile.identifier.toText(),
        nickname: profile.nickname,
        localKey: profile.localKey ? localKeyMap.get(profile.localKey) : undefined,
        linkedPersona: profile.linkedPersona?.toText(),
    }
}

export function GroupRecordToJSONFormat(group: GroupRecord): BackupJSONFileLatest['userGroups'][0] {
    return {
        groupName: group.groupName,
        identifier: group.identifier.toText(),
        members: group.members.map(x => x.toText()),
        banned: group.banned?.map(x => x.toText()),
    }
}

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
