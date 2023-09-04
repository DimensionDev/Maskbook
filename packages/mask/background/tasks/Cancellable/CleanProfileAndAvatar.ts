import { consistentPersonaDBWriteAccess } from '../../database/persona/db.js'
import { ProfileIdentifier } from '@masknet/shared-base'
import { cleanAvatarDB } from '../../database/avatar-cache/cleanup.js'
import { hmr } from '../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)
try {
    cleanProfileWithNoLinkedPersona(signal)
} catch {}

async function cleanRelationDB(anotherList: Set<ProfileIdentifier>) {
    await consistentPersonaDBWriteAccess(async (t) => {
        for await (const x of t.objectStore('relations')) {
            const profileIdentifier = ProfileIdentifier.from(x.value.profile)
            if (profileIdentifier.isSome()) {
                if (anotherList.has(profileIdentifier.value)) x.delete()
            }
        }
    })
}

async function cleanProfileWithNoLinkedPersona(signal: AbortSignal) {
    const timeout = setTimeout(cleanProfileWithNoLinkedPersona, 1000 * 60 * 60 * 24 /** 1 day */, signal)
    signal.addEventListener('abort', () => clearTimeout(timeout))

    const cleanedList = new Set<ProfileIdentifier>()
    const expired = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 /** days */)
    await consistentPersonaDBWriteAccess(async (t) => {
        if (signal.aborted) throw new Error('Abort')
        for await (const x of t.objectStore('profiles')) {
            if (x.value.linkedPersona) continue
            if (expired < x.value.updatedAt) continue
            const id = ProfileIdentifier.from(x.value.identifier)
            if (id.isSome()) cleanedList.add(id.value)
            await x.delete()
        }
    }, false)
    await cleanAvatarDB(cleanedList)
    await cleanRelationDB(cleanedList)
}
