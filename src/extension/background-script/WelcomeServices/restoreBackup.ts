import type { ProfileIdentifier } from '../../../database/type'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import {
    attachProfileDB,
    createOrUpdatePersonaDB,
    createOrUpdateProfileDB,
    consistentPersonaDBWriteAccess,
} from '../../../database/Persona/Persona.db'
import { PersonaRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { PostRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'
import { createOrUpdatePostDB } from '../../../database/post'
import { GroupRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/GroupRecord'
import { createOrUpdateUserGroupDatabase } from '../../../database/group'
import { i18n } from '../../../utils/i18n-next'
import { MessageCenter } from '../../../utils/messages'
import { currentImportingBackup } from '../../../components/shared-settings/settings'

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: ProfileIdentifier) {
    currentImportingBackup.value = true
    try {
        const data = UpgradeBackupJSONFile(json, whoAmI)
        if (!data) throw new TypeError(i18n.t('service_invalid_backup_file'))

        MessageCenter.startBatch()
        {
            await consistentPersonaDBWriteAccess(async (t) => {
                for (const x of data.personas) {
                    await createOrUpdatePersonaDB(
                        PersonaRecordFromJSONFormat(x),
                        { explicitUndefinedField: 'ignore', linkedProfiles: 'merge' },
                        t,
                    )
                }

                for (const x of data.profiles) {
                    const { linkedPersona, ...record } = ProfileRecordFromJSONFormat(x)
                    await createOrUpdateProfileDB(record, t)
                    if (linkedPersona) {
                        await attachProfileDB(
                            record.identifier,
                            linkedPersona,
                            { connectionConfirmState: 'confirmed' },
                            t,
                        )
                    }
                }
            })
        }

        for (const x of data.posts) {
            await createOrUpdatePostDB(PostRecordFromJSONFormat(x), 'append')
        }

        for (const x of data.userGroups) {
            const rec = GroupRecordFromJSONFormat(x)
            await createOrUpdateUserGroupDatabase(rec, 'append')
        }
    } finally {
        MessageCenter.commitBatch()
        currentImportingBackup.value = false
    }
}

const uncomfirmedBackup = new Map<string, object>()

export async function restoreBackupAfterConfirmation(id: string, json: object) {
    uncomfirmedBackup.set(id, json)
}

export async function restoreBackupConfirmation(id: string, whoAmI?: ProfileIdentifier) {
    if (uncomfirmedBackup.has(id)) {
        await restoreBackup(uncomfirmedBackup.get(id)!, whoAmI)
        uncomfirmedBackup.delete(id)
    } else {
        throw new Error('cannot find backup')
    }
}
