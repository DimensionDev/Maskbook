/**
 * @deprecated
 * ! This version of database is deprecated
 * ! Don't use it.
 *
 * ! Scheduled to remove it after Jan/1/2019
 * ! This database should be readonly now.
 */
import { Entity, Index, Db } from 'typed-db'
import { buildQuery } from '../utils/utils'

@Entity()
class AvatarRecord {
    @Index({ unique: true })
    username!: string
    nickname!: string
    avatar!: ArrayBuffer
    lastUpdateTime!: Date
}

/**
 * @deprecated
 */
export async function queryAvatarDataDeprecated() {
    const query = buildQuery(new Db('maskbook-avatar-store', 1), AvatarRecord)
    const record = await query(t => t.openCursor().asList())
    return record
}
/**
 * @deprecated
 */
const cache = new Map<string, string>()
/**
 * @deprecated
 */
async function toDataUrl(x: ArrayBuffer, username?: string): Promise<string> {
    function ArrayBufferToBase64(buffer: ArrayBuffer) {
        const f = new Blob([buffer], { type: 'image/png' })
        const fr = new FileReader()
        return new Promise<string>(resolve => {
            fr.onload = () => resolve(fr.result as string)
            fr.readAsDataURL(f)
        })
    }
    const createAndStore = async () => {
        const u = await ArrayBufferToBase64(x)
        cache.set(username || '$', u)
        return u
    }
    if (username) return cache.get(username) || createAndStore()
    return createAndStore()
}
