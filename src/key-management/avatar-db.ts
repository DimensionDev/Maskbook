import { Entity, Index, Db } from 'typed-db'
import { buildQuery } from '../utils/utils'

@Entity()
class AvatarRecord {
    @Index({ unique: true })
    username!: string
    avatar!: ArrayBuffer
    lastUpdateTime!: Date
}

const query = buildQuery(new Db('maskbook-avatar-store', 1), AvatarRecord)

export async function queryAvatar(username: string): Promise<undefined | string> {
    const result = await query(t => t.get(username))
    if (!result) return
    return toDataUrl(result.avatar, username)
}
export async function storeAvatar(username: string, avatar: ArrayBuffer | string) {
    const last = await query(t => t.get(username))
    if (last && (Date.now() - last.lastUpdateTime.getTime()) / 1000 / 60 / 60 / 24 < 14) {
        return
    }
    let bf: ArrayBuffer
    if (typeof avatar === 'string') bf = await downloadAvatar(avatar)
    else bf = avatar
    query(t => t.add({ username, avatar: bf, lastUpdateTime: new Date() }, username), 'readwrite')
}
async function downloadAvatar(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url)
    return res.arrayBuffer()
}
const cache = new Map<string, string>()
function toDataUrl(x: ArrayBuffer, username?: string): string {
    const createAndStore = () => {
        const f = new Blob([x], { type: 'image/png' })
        const u = URL.createObjectURL(f)
        cache.set(username || '$', u)
        return u
    }
    if (username) return cache.get(username) || createAndStore()
    return createAndStore()
}
