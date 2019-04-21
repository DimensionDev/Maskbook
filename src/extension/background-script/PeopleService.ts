import { AsyncCall, OnlyRunInContext } from '@holoflows/kit/es'
import { FriendServiceName } from '../../utils/constants'
import {
    queryPeopleCryptoKey,
    calculateFingerprint,
    getMyPrivateKey,
    CryptoKeyRecord,
    toReadCryptoKey,
    storeKey,
    queryPersonCryptoKey,
} from '../../key-management/keystore-db'
import { queryAvatar, storeAvatar, queryNickname } from '../../key-management/avatar-db'
import { uploadProvePostUrl } from '../../key-management/people-gun'
import { storeLocalKey } from '../../key-management/local-db'

OnlyRunInContext('background', 'FriendService')
export interface Person {
    username: string
    nickname?: string
    avatar?: string
    fingerprint?: string
}

export async function queryPerson(username: string): Promise<Person> {
    const avatar = queryAvatar(username)
    const nickname = queryNickname(username)
    const key = await queryPersonCryptoKey(username)
    return {
        username: username,
        fingerprint: key ? await calculateFingerprint(key) : undefined,
        avatar: await avatar,
        nickname: await nickname,
    }
}
async function queryPeople(): Promise<Person[]> {
    const keys = await queryPeopleCryptoKey()
    const p = Promise.all(keys.map<Promise<Person>>(k => queryPerson(k.username)))
    return p
}
async function storeKeyService(key: { key: CryptoKeyRecord; local: JsonWebKey }) {
    const k = await toReadCryptoKey(key.key)
    const a = storeKey(k)
    const b = storeLocalKey(
        await crypto.subtle.importKey('jwk', key.local, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']),
    )
    await a
    await b
    console.log('Keypair restored.', key)
}

const Impl = {
    queryPeople,
    uploadProvePostUrl,
    storeAvatar,
    queryAvatar,
    getMyPrivateKey,
    storeKey: storeKeyService,
    queryPerson,
}
Object.assign(window, { friendService: Impl })
export type PeopleService = typeof Impl
AsyncCall(Impl, { key: FriendServiceName })
