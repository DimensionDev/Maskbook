import { consistentPersonaDBWriteAccess } from '../database/persona/db'
import { IdentifierMap, Identifier, ProfileIdentifier } from '@masknet/shared-base'
import { cleanAvatarDB } from '../database/avatar-cache/cleanup'

async function cleanRelationDB(anotherList: IdentifierMap<ProfileIdentifier, undefined>) {
    await consistentPersonaDBWriteAccess(async (t) => {
        for await (const x of t.objectStore('relations')) {
            const profileIdentifier = Identifier.fromString(x.value.profile, ProfileIdentifier).unwrap()
            if (anotherList.has(profileIdentifier)) x.delete()
        }
    })
}

export default async function cleanProfileWithNoLinkedPersona(signal: AbortSignal) {
    const timeout = setTimeout(cleanProfileWithNoLinkedPersona, 1000 * 60 * 60 * 24 /** 1 day */)
    signal.addEventListener('abort', () => clearTimeout(timeout))

    const cleanedList = new IdentifierMap<ProfileIdentifier, undefined>(new Map(), ProfileIdentifier)
    const expired = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 /** days */)
    await consistentPersonaDBWriteAccess(async (t) => {
        if (signal.aborted) throw new Error('Abort')
        for await (const x of t.objectStore('profiles')) {
            if (x.value.linkedPersona) continue
            if (expired < x.value.updatedAt) continue
            const id = Identifier.fromString(x.value.identifier, ProfileIdentifier)
            if (id.ok) cleanedList.set(id.val, undefined)
            await x.delete()
        }
    }, false)
    await cleanAvatarDB(cleanedList)
    await cleanRelationDB(cleanedList)
}

export {}
