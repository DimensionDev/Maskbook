import type { NormalizedBackup } from '@masknet/backup-format'
import { compact, flatten, sumBy } from 'lodash-es'

export interface BackupSummary {
    personas: string[]
    accounts: number
    posts: number
    contacts: number
    relations: number
    files: number
    wallets: string[]
    createdAt: number
    countOfWallet?: number
}

export function getBackupSummary(json: NormalizedBackup.Data, countOfWallet?: number): BackupSummary {
    let files = 0

    try {
        files = Number((json.plugins?.['com.maskbook.fileservice'] as any)?.length || 0)
    } catch {}

    const ownerPersonas = [...json.personas.values()].filter((persona) => !persona.privateKey.none)
    const ownerProfiles = flatten(ownerPersonas.map((persona) => [...persona.linkedProfiles.keys()])).map((item) =>
        item.toText(),
    )

    const personas = compact(
        ownerPersonas
            .sort((p) => (p.nickname.unwrapOr(false) ? -1 : 0))
            .map((p) => p.nickname.unwrapOr(p.identifier.rawPublicKey).trim()),
    )
    return {
        // Names or publicKeys */
        personas,
        accounts: sumBy(ownerPersonas, (persona) => persona.linkedProfiles.size),
        posts: json.posts.size,
        contacts: [...json.profiles.values()].filter((profile) => !ownerProfiles.includes(profile.identifier.toText()))
            .length,
        relations: json.relations.length,
        files,
        wallets: json.wallets.map((wallet) => wallet.address),
        createdAt: Number(json.meta.createdAt),
        countOfWallet,
    }
}
