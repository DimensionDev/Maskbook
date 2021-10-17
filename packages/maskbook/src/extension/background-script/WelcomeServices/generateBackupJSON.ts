import { ProviderType } from '@masknet/web3-shared-evm'
import {
    BackupJSONFileLatest,
    BackupPreview,
    getBackupPreviewInfo,
} from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { queryPersonasDB, queryProfilesDB } from '../../../database/Persona/Persona.db'
import { queryPostsDB } from '../../../database/post'
import { PersonaRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { PostRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PostRecord'
import { Identifier, PersonaIdentifier, ProfileIdentifier } from '../../../database/type'
import { getWallets } from '../../../plugins/Wallet/services'
import { WalletRecordToJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/WalletRecord'
import { activatedPluginsWorker } from '@masknet/plugin-infra'
import { timeout } from '@masknet/shared'

export type { BackupPreview } from '../../../utils/type-transform/BackupFormat/JSON/latest'
export interface BackupOptions {
    noPosts: boolean
    noWallets: boolean
    noPersonas: boolean
    noProfiles: boolean
    noPlugins: boolean
    hasPrivateKeyOnly: boolean
    filter: { type: 'persona'; wanted: PersonaIdentifier[] }
}
export async function generateBackupJSON(opts: Partial<BackupOptions> = {}): Promise<BackupJSONFileLatest> {
    const personas: BackupJSONFileLatest['personas'] = []
    const posts: BackupJSONFileLatest['posts'] = []
    const wallets: BackupJSONFileLatest['wallets'] = []
    const profiles: BackupJSONFileLatest['profiles'] = []
    const plugins: NonNullable<BackupJSONFileLatest['plugin']> = {}

    if (!opts.filter) {
        if (!opts.noPersonas) await backupPersonas()
        if (!opts.noProfiles) await backProfiles()
    } else if (opts.filter.type === 'persona') {
        if (opts.noPersonas) throw new TypeError('Invalid opts')
        await backupPersonas(opts.filter.wanted)
        const wantedProfiles: ProfileIdentifier[] = personas.flatMap((q) =>
            q.linkedProfiles
                .map((y) => Identifier.fromString(y[0], ProfileIdentifier))
                .filter((k) => k.ok)
                .map((x) => x.val as ProfileIdentifier),
        )
        if (!opts.noProfiles) await backProfiles(wantedProfiles)
    }
    if (!opts.noPosts) await backupAllPosts()
    if (!opts.noWallets) await backupAllWallets()
    if (!opts.noPlugins) await backupAllPlugins()

    const file: BackupJSONFileLatest = {
        _meta_: {
            createdAt: Date.now(),
            maskbookVersion: browser.runtime.getManifest().version,
            version: 2,
            type: 'maskbook-backup',
        },
        grantedHostPermissions: (await browser.permissions.getAll()).origins || [],
        personas,
        posts,
        wallets,
        profiles,
        userGroups: [],
    }
    if (Object.keys(plugins).length) file.plugin = plugins
    return file

    async function backupAllPosts() {
        posts.push(...(await queryPostsDB(() => true)).map(PostRecordToJSONFormat))
    }

    async function backProfiles(of?: ProfileIdentifier[]) {
        const data = (
            await queryProfilesDB((p) => {
                if (of === undefined) return true
                if (!of.some((x) => x.equals(p.identifier))) return false
                if (!p.linkedPersona) return false
                return true
            })
        ).map(ProfileRecordToJSONFormat)
        profiles.push(...data)
    }

    async function backupPersonas(of?: PersonaIdentifier[]) {
        const data = (
            await queryPersonasDB(
                (p) => {
                    if (p.uninitialized) return false
                    if (opts.hasPrivateKeyOnly && !p.privateKey) return false
                    if (of === undefined) return true
                    if (!of.some((x) => x.equals(p.identifier))) return false
                    return true
                },
                undefined,
                true,
            )
        ).map(PersonaRecordToJSONFormat)
        personas.push(...data)
    }

    async function backupAllWallets() {
        const wallets_ = (await getWallets(ProviderType.MaskWallet)).map(WalletRecordToJSONFormat)
        wallets.push(...wallets_)
    }

    async function backupAllPlugins() {
        await Promise.all(
            [...activatedPluginsWorker]
                // generate backup
                .map(async (plugin) => {
                    const backupCreator = plugin.backup?.onBackup
                    if (!backupCreator) return

                    async function backupPlugin() {
                        const result = await timeout(backupCreator!(), 3000)
                        if (result.none) return
                        // We limit the plugin contributed backups must be simple objects.
                        // We may allow plugin to store binary if we're moving to binary backup format like messagepack.
                        plugins[plugin.ID] = result.map(JSON.stringify).map(JSON.parse).val
                    }
                    if (process.env.NODE_ENV === 'development') return backupPlugin()
                    return backupPlugin().catch((error) =>
                        console.error(`[@masknet/plugin-infra] Plugin ${plugin.ID} failed to backup`, error),
                    )
                }),
        )
    }
}

export async function generateBackupPreviewInfo(opts: Partial<BackupOptions> = {}): Promise<BackupPreview> {
    const json = await generateBackupJSON(opts)
    return getBackupPreviewInfo(json)
}
