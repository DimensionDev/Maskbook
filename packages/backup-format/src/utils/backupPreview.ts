import type { NormalizedBackup } from '@masknet/backup-format'
import { flatten, sumBy } from 'lodash-es'

export interface BackupPreview {
    personas: number
    accounts: number
    posts: number
    contacts: number
    relations: number
    files: number
    wallets: number
    createdAt: number
}

export function getBackupPreviewInfo(json: NormalizedBackup.Data): BackupPreview {
    let files = 0

    try {
        files = Number((json.plugins['com.maskbook.fileservice'] as any)?.length || 0)
    } catch {}

    const ownerPersonas = [...json.personas.values()].filter((persona) => !persona.privateKey.none)
    const ownerProfiles = flatten(ownerPersonas.map((persona) => [...persona.linkedProfiles.keys()])).map((item) =>
        item.toText(),
    )

    return {
        personas: json.personas.size,
        accounts: sumBy(ownerPersonas, (persona) => persona.linkedProfiles.size),
        posts: json.posts.size,
        contacts: [...json.profiles.values()].filter((profile) => !ownerProfiles.includes(profile.identifier.toText()))
            .length,
        relations: json.relations.length,
        files,
        wallets: json.wallets.length,
        createdAt: Number(json.meta.createdAt),
    }
}
