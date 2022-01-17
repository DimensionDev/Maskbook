import { KeyValue } from '@masknet/web3-providers'
import { PetsPluginID } from '../constants'
import type { User } from '../types'

const storage = KeyValue.createJSON_Storage(PetsPluginID)

export async function setUserAddress(user: User) {
    await storage.set(user.userId, user.address)
}

export async function getUserAddress(userId: string) {
    return storage.get(userId)
}
