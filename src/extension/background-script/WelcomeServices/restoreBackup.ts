import { ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../../database/type'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { geti18nString } from '../../../utils/i18n'
import { getKeyParameter, JsonWebKeyToCryptoKey } from '../../../utils/type-transform/CryptoKey-JsonWebKey'
import { PersonaDBAccess, createPersonaDB, attachProfileDB } from '../../../database/Persona/Persona.db'
import { updateOrCreateProfile } from '../../../database'
import { PersonaRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { PostRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'
import { createPostDB } from '../../../database/post'
import { GroupRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/GroupRecord'
import { createUserGroupDatabase, updateUserGroupDatabase } from '../../../database/group'

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: ProfileIdentifier): Promise<void> {
    const data = UpgradeBackupJSONFile(json, whoAmI)
    if (!data) throw new TypeError(geti18nString('service_invalid_backup_file'))

    const keyCache = new Map<JsonWebKey, CryptoKey>()
    const aes = getKeyParameter('aes')

    // Transform all JsonWebKey to CryptoKey
    await Promise.all([
        ...[...data.personas, ...data.profiles]
            .filter(x => x.localKey)
            .map(x => JsonWebKeyToCryptoKey(x.localKey!, ...aes).then(k => keyCache.set(x.localKey!, k))),
    ])
    {
        const t: any = (await PersonaDBAccess()).transaction(['personas', 'profiles'], 'readwrite')
        for (const x of data.personas) {
            await createPersonaDB(PersonaRecordFromJSONFormat(x, keyCache), t)
        }

        for (const x of data.profiles) {
            const { linkedPersona, ...record } = ProfileRecordFromJSONFormat(x, keyCache)
            await updateOrCreateProfile(record, t)
            if (linkedPersona) {
                await attachProfileDB(record.identifier, linkedPersona, { connectionConfirmState: 'confirmed' }, t)
            }
        }
        // ! transaction t ends here.
    }

    for (const x of data.posts) {
        if (x.postCryptoKey) {
            const c = await JsonWebKeyToCryptoKey(x.postCryptoKey, ...aes)
            keyCache.set(x.postCryptoKey, c)
        }
        await createPostDB(PostRecordFromJSONFormat(x, keyCache))
    }

    for (const x of data.userGroups) {
        const rec = GroupRecordFromJSONFormat(x)
        await createUserGroupDatabase(rec.identifier, rec.groupName)
        await updateUserGroupDatabase(rec, 'append')
    }
}
