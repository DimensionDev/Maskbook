import type { ProfileIdentifier } from '../../../database/type'
import { UpgradeBackupJSONFile, BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
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
import { currentImportingBackup } from '../../../settings/settings'
import { WalletRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/WalletRecord'
import { importNewWallet } from '../../../plugins/Wallet/services'

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: ProfileIdentifier) {
    currentImportingBackup.value = true
    try {
        const data = UpgradeBackupJSONFile(json, whoAmI)
        if (!data) throw new TypeError(i18n.t('service_invalid_backup_file'))

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

        for (const [i, x] of data.wallets.entries()) {
            const record = WalletRecordFromJSONFormat(x)
            if (record.mnemonic || record._private_key_) await importNewWallet(record, i !== 0)
        }

        for (const x of data.posts) {
            await createOrUpdatePostDB(PostRecordFromJSONFormat(x), 'append')
        }

        for (const x of data.userGroups) {
            const rec = GroupRecordFromJSONFormat(x)
            await createOrUpdateUserGroupDatabase(rec, 'append')
        }
    } finally {
        currentImportingBackup.value = false
    }
}

const uncomfirmedBackup = new Map<string, BackupJSONFileLatest>()

/**
 * Restore backup step 1: store the unconfirmed backup in cached
 * @param id the uuid for each restoration
 * @param json the backup to be cached
 */
export async function setUnconfirmedBackup(id: string, json: BackupJSONFileLatest) {
    uncomfirmedBackup.set(id, json)
}

/**
 * Get the unconfirmed backup with uuid
 * @param id the uuid for each restoration
 */
export async function getUnconfirmedBackup(id: string) {
    return uncomfirmedBackup.get(id)
}

/**
 * Restore backup step 2: restore the unconfirmed backup with uuid
 * @param id the uuid for each restoration
 */
export async function confirmBackup(id: string, whoAmI?: ProfileIdentifier) {
    if (uncomfirmedBackup.has(id)) {
        await restoreBackup(uncomfirmedBackup.get(id)!, whoAmI)
        uncomfirmedBackup.delete(id)
    } else {
        throw new Error('cannot find backup')
    }
}
