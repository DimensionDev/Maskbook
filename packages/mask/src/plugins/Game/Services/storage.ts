import { KeyValue } from '@masknet/web3-providers'
import { GamePluginID } from '../constants'
import type { User } from '../types'

const storage = KeyValue.createJSON_Storage(GamePluginID)

export async function setUserAddress(user: User) {
    await storage.set(user.userId, user.address)
}

export async function getUserAddress(userId: string) {
    if (!userId || userId === '$unknown') return ''
    return storage.get(userId)
}
