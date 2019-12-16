import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { queryPersonasDB, queryProfilesDB } from '../../../database/Persona/Persona.db'
import { CryptoKeyToJsonWebKey } from '../../../utils/type-transform/CryptoKey-JsonWebKey'
import { queryUserGroupsDatabase } from '../../../database/group'
import { queryPostsDB } from '../../../database/post'
import { PersonaRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { GroupRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/GroupRecord'
import { PostRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'

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
