import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { FriendServiceName } from '../../utils/Names'
import {
    getAllKeys,
    calculateFingerprint,
    getMyPrivateKey,
    CryptoKeyRecord,
    toReadCryptoKey,
} from '../../key-management/db'
import { queryAvatar, storeAvatar } from '../../key-management/avatar-db'
import { uploadProvePostUrl } from '../../key-management'

OnlyRunInContext('background', 'FriendService')
export interface Person {
    username: string
    avatar?: string
    fingerprint?: string
}

async function fetchPublicKey(name: string) {}
async function fetchStoredPeople() {}
async function getAllPeople(): Promise<Person[]> {
    const keys = await getAllKeys()
    const p = Promise.all(
        keys.map<Promise<Person>>(async k => ({
            username: k.username,
            fingerprint: await calculateFingerprint(k.username),
            avatar: await queryAvatar(k.username),
        })),
    )
    return p
}
async function storeKey(key: CryptoKeyRecord) {
    const k = await toReadCryptoKey(key)
    await storeKey(key)
    console.log('Keypair restored.', key)
}

const Impl = {
    getAllPeople,
    uploadProvePostUrl,
    storeAvatar,
    getMyPrivateKey,
    storeKey,
}
Object.assign(window, { friendService: Impl })
export type PeopleService = typeof Impl
AsyncCall<PeopleService, {}>(FriendServiceName, Impl, {}, MessageCenter, true)
