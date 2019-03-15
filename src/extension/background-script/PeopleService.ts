import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { FriendServiceName } from '../../utils/Names'

OnlyRunInContext('background', 'FriendService')
export interface Person {
    username: string
    avatar?: string
    fingerprint?: string
}

async function fetchPublicKey(name: string) {}
async function fetchStoredPeople() {}

const Impl = {}
Object.assign(window, { friendService: Impl })
export type PeopleService = typeof Impl
AsyncCall<PeopleService, {}>(FriendServiceName, Impl, {}, MessageCenter, true)
