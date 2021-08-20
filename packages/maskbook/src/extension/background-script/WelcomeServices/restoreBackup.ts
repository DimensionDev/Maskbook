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
import { i18n } from '../../../utils/i18n-next'
import { currentImportingBackup } from '../../../settings/settings'
import { WalletRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/WalletRecord'
import { importNewWallet } from '../../../plugins/Wallet/services'
import { activatedPluginsWorker, registeredPluginIDs } from '@masknet/plugin-infra'
import { Result } from 'ts-results'

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

        const plugins = [...activatedPluginsWorker]
        const works = new Set<Promise<Result<void, unknown>>>()
        for (const [pluginID, item] of Object.entries(data.plugin || {})) {
            const plugin = plugins.find((x) => x.ID === pluginID)
            // should we warn user here?
            if (!plugin) {
                if ([...registeredPluginIDs].includes(pluginID))
                    console.warn(`[@masknet/plugin-infra] Found a backup of a not enabled plugin ${plugin}`, item)
                else console.warn(`[@masknet/plugin-infra] Found an unknown plugin backup of ${plugin}`, item)
                continue
            }

            const f = plugin.backup?.onRestore
            if (!f) {
                console.warn(
                    `[@masknet/plugin-infra] Found a backup of plugin ${plugin} but it did not register a onRestore callback.`,
                    item,
                )
                continue
            }
            const x = Result.wrapAsync(async () => {
                const x = await f(item)
                if (x.err) console.error(`[@masknet/plugin-infra] Plugin ${plugin} failed to restore its backup.`, item)
                return x.unwrap()
            })
            works.add(x)
        }
        await Promise.all(works)
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
