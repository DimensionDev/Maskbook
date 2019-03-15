import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { FriendServiceName } from '../../utils/Names'
import { getAllKeys, PersonCryptoKey, calculateFingerprint } from '../../key-management/db'
import { memoize } from 'lodash-es'
import { queryAvatar } from '../../key-management/avatar-db'

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

const Impl = {
    getAllPeople,
}
Object.assign(window, { friendService: Impl })
export type PeopleService = typeof Impl
AsyncCall<PeopleService, {}>(FriendServiceName, Impl, {}, MessageCenter, true)
