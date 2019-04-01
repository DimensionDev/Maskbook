import { Entity, Index, Db } from 'typed-db'
import { buildQuery, fileReference } from '../utils/utils'

@Entity()
class AvatarRecord {
    @Index({ unique: true })
    username!: string
    nickname!: string
    avatar!: ArrayBuffer
    lastUpdateTime!: Date
}

const query = buildQuery(new Db('maskbook-avatar-store', 1), AvatarRecord)

export async function queryAvatar(username: string): Promise<undefined | string> {
    const result = await query(t => t.get(username))
    if (!result) return
    return toDataUrl(result.avatar, username)
}
export async function queryNickname(username: string): Promise<string | undefined> {
    const result = await query(t => t.get(username))
    if (!result) return
    return result.nickname
}
export async function storeAvatar(username: string, nickname: string, avatar: ArrayBuffer | string) {
    const last = await query(t => t.get(username))
    if (last && (Date.now() - last.lastUpdateTime.getTime()) / 1000 / 60 / 60 / 24 < 14) {
        return
    }
    let bf: ArrayBuffer
    if (typeof avatar === 'string') bf = await downloadAvatar(avatar)
    else bf = avatar
    query(t => t.add({ username, avatar: bf, lastUpdateTime: new Date(), nickname }, username), 'readwrite')
}
async function downloadAvatar(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url)
    return res.arrayBuffer()
}
const cache = new Map<string, string>()
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
