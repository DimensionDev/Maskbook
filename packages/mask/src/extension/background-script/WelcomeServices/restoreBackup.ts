import type { ProfileIdentifier } from '@masknet/shared-base'
import { RelationFavor } from '@masknet/shared-base'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils'
import { i18n } from '../../../../shared-ui/locales_legacy'
import {
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    createOrUpdatePersonaDB,
    createOrUpdateProfileDB,
} from '../../../database/Persona/Persona.db'
import { PersonaRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { PostRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'
import { createOrUpdatePostDB, PostDBAccess } from '../../../database'
import { WalletRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/WalletRecord'
import { recoverWalletFromMnemonic, recoverWalletFromPrivateKey } from '../../../plugins/Wallet/services'
import { activatedPluginsWorker, registeredPluginIDs } from '@masknet/plugin-infra'
import { Result } from 'ts-results'
import { addWallet } from '../../../plugins/Wallet/services/wallet/database'
import { patchCreateNewRelation, patchCreateOrUpdateRelation } from '../IdentityService'
import { RelationRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/RelationRecord'

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: ProfileIdentifier) {
    const data = UpgradeBackupJSONFile(json, whoAmI)
    if (!data) throw new TypeError(i18n.t('service_invalid_backup_file'))

    {
        await consistentPersonaDBWriteAccess(async (t) => {
            for (const x of data.personas) {
                await createOrUpdatePersonaDB(
                    PersonaRecordFromJSONFormat(x),
                    { explicitUndefinedField: 'ignore', linkedProfiles: 'merge', protectPrivateKey: true },
                    t,
                )
            }

            for (const x of data.profiles) {
                const { linkedPersona, ...record } = ProfileRecordFromJSONFormat(x)
                await createOrUpdateProfileDB(record, t)
                if (linkedPersona) {
                    await attachProfileDB(record.identifier, linkedPersona, { connectionConfirmState: 'confirmed' }, t)
                }
            }
        })
    }

    for (const [_, x] of data.wallets.entries()) {
        const record = WalletRecordFromJSONFormat(x)
        const name = record.name
        try {
            if (record.storedKeyInfo && record.derivationPath)
                await addWallet(record.address, name, record.derivationPath, record.storedKeyInfo)
            else if (record.privateKey) await recoverWalletFromPrivateKey(name, record.privateKey)
            else if (record.mnemonic) await recoverWalletFromMnemonic(name, record.mnemonic, record.derivationPath)
        } catch (error) {
            console.error(error)
        }
    }
    {
        const postDBTransaction = (await PostDBAccess()).transaction('post', 'readwrite')
        for (const x of data.posts) {
            await createOrUpdatePostDB(PostRecordFromJSONFormat(x), 'append', postDBTransaction)
        }
    }

    if (data.relations?.length) {
        const relations = data.relations.map(RelationRecordFromJSONFormat)
        await patchCreateNewRelation(relations)
    } else {
        // For 1.x backups
        const personas = data.personas
            .map(PersonaRecordFromJSONFormat)
            .filter((x) => x.privateKey)
            .map((x) => x.identifier)
        const profiles = data.profiles.map(ProfileRecordFromJSONFormat).map((x) => x.identifier)
        await patchCreateOrUpdateRelation(profiles, personas, RelationFavor.UNCOLLECTED)
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
}

const unconfirmedBackup = new Map<string, BackupJSONFileLatest>()

/**
 * Restore backup step 1: store the unconfirmed backup in cached
 * @param id the uuid for each restoration
 * @param json the backup to be cached
 */
export async function setUnconfirmedBackup(id: string, json: BackupJSONFileLatest) {
    unconfirmedBackup.set(id, json)
}

/**
 * Get the unconfirmed backup with uuid
 * @param id the uuid for each restoration
 */
export async function getUnconfirmedBackup(id: string) {
    return unconfirmedBackup.get(id)
}

/**
 * Restore backup step 2: restore the unconfirmed backup with uuid
 * @param id the uuid for each restoration
 */
export async function confirmBackup(id: string, whoAmI?: ProfileIdentifier) {
    if (unconfirmedBackup.has(id)) {
        await restoreBackup(unconfirmedBackup.get(id)!, whoAmI)
        unconfirmedBackup.delete(id)
    } else {
        throw new Error('cannot find backup')
    }
}
