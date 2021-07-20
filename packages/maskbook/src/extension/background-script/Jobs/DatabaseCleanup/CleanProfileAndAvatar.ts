import { createAvatarDBAccess, queryAvatarOutdatedDB, deleteAvatarsDB } from '../../../../database/avatar'
import { createTransaction } from '../../../../database/helpers/openDB'
import { consistentPersonaDBWriteAccess } from '../../../../database/Persona/Persona.db'
import { Identifier, ProfileIdentifier, GroupIdentifier } from '../../../../database/type'
import { IdentifierMap } from '../../../../database/IdentifierMap'
import { untilDocumentReady } from '../../../../utils'

async function cleanAvatarDB(anotherList: IdentifierMap<ProfileIdentifier | GroupIdentifier, undefined>) {
    const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('avatars', 'metadata')
    const outdated = await queryAvatarOutdatedDB('lastAccessTime', t)
    for (const each of outdated) {
        anotherList.set(each, undefined)
    }
    await deleteAvatarsDB(Array.from(anotherList.keys()), t)
}

export default async function cleanProfileWithNoLinkedPersona(signal: AbortSignal) {
    await untilDocumentReady()
    const timeout = setTimeout(cleanProfileWithNoLinkedPersona, 1000 * 60 * 60 * 24 /** 1 day */)
    signal.addEventListener('abort', () => clearTimeout(timeout))

    const cleanedList = new IdentifierMap<ProfileIdentifier | GroupIdentifier, undefined>(
        new Map(),
        ProfileIdentifier,
        GroupIdentifier,
    )
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
}

export {}
