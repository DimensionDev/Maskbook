import { KeyValue } from '@masknet/web3-providers'
import { PetsPluginID } from '../constants'
import type { User } from '../types'

const storage = KeyValue.createJSON_Storage<string>(PetsPluginID)

export async function setUserAddress(user: User) {
    await storage.set(user.userId, user.address)
}

export async function getUserAddress(userId: string) {
    if (!userId || userId === '$unknown') return ''
    return storage.get(userId)
}
