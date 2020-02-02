import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { queryPersonasDB, queryProfilesDB } from '../../../database/Persona/Persona.db'
import { CryptoKeyToJsonWebKey } from '../../../utils/type-transform/CryptoKey-JsonWebKey'
import { queryUserGroupsDatabase } from '../../../database/group'
import { queryPostsDB } from '../../../database/post'
import { PersonaRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { GroupRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/GroupRecord'
import { PostRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'
import { ProfileIdentifier, PersonaIdentifier, Identifier } from '../../../database/type'

export interface BackupOptions {
    noPosts: boolean
    noUserGroups: boolean
    noPersonas: boolean
    noProfiles: boolean
    hasPrivateKeyOnly: boolean
    filter: { type: 'persona'; wanted: PersonaIdentifier[] }
}
export async function generateBackupJSON(opts: Partial<BackupOptions> = {}): Promise<BackupJSONFileLatest> {
    const personas: BackupJSONFileLatest['personas'] = []
    const posts: BackupJSONFileLatest['posts'] = []
    const profiles: BackupJSONFileLatest['profiles'] = []
    const userGroups: BackupJSONFileLatest['userGroups'] = []

    const map = new WeakMap<CryptoKey, JsonWebKey>()
    if (!opts.filter) {
        if (!opts.noPersonas) await backupPersona()
        if (!opts.noProfiles) await backProfiles()
    } else if (opts.filter.type === 'persona') {
        if (opts.noPersonas) throw new TypeError('Invalid opts')
        await backupPersona(opts.filter.wanted)
        const wantedProfiles: ProfileIdentifier[] = personas.flatMap(q =>
            q.linkedProfiles
                .map(y => Identifier.fromString(y[0], ProfileIdentifier))
                .filter(k => k.ok)
                .map(x => x.val as ProfileIdentifier),
        )
        if (!opts.noProfiles) await backProfiles(wantedProfiles)
    }
    if (!opts.noUserGroups) await backupAllUserGroups()
    if (!opts.noPosts) await backupAllPosts()

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

    async function backupAllPosts() {
        const data = await queryPostsDB(() => true)
        await Promise.all(
            data.map(
                async x =>
                    x.postCryptoKey &&
                    // ? Some old post key is not exportable. Skip them if export failed.
                    CryptoKeyToJsonWebKey(x.postCryptoKey).then(
                        y => map.set(x.postCryptoKey!, y),
                        () => {},
                    ),
            ),
        )
        data.filter(x => !!map.get(x.postCryptoKey!)).forEach(x => posts.push(PostRecordToJSONFormat(x, map)))
    }

    async function backupAllUserGroups() {
        const data = await queryUserGroupsDatabase(() => true)
        data.forEach(x => userGroups.push(GroupRecordToJSONFormat(x)))
    }

    async function backProfiles(of?: ProfileIdentifier[]) {
        const data = await queryProfilesDB(p => {
            if (of === undefined) return true
            if (!of.some(x => x.equals(p.identifier))) return false
            return true
        })
        await Promise.all(
            data.map(async x => x.localKey && map.set(x.localKey, await CryptoKeyToJsonWebKey(x.localKey))),
        )
        data.filter(x => !!x.linkedPersona).forEach(x => profiles.push(ProfileRecordToJSONFormat(x, map)))
    }

    async function backupPersona(of?: PersonaIdentifier[]) {
        const data = await queryPersonasDB(p => {
            if (opts.hasPrivateKeyOnly && !p.privateKey) return false
            if (of === undefined) return true
            if (!of.some(x => x.equals(p.identifier))) return false
            return true
        })
        await Promise.all(
            data.map(async x => x.localKey && map.set(x.localKey, await CryptoKeyToJsonWebKey(x.localKey))),
        )
        data.forEach(x => personas.push(PersonaRecordToJSONFormat(x, map)))
    }
}
