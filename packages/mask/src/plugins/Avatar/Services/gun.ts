import { delay } from '@masknet/shared-base'
import { getGunData, setGunData } from '@masknet/gun-utils'
import { NFT_AVATAR_GUN_ROOT_NODE } from '../constants'

// After reinstalling the system, it cannot be retrieved for the first time, so it needs to be taken twice
export async function getUserAddress(userId: string) {
    let result = await getGunData(NFT_AVATAR_GUN_ROOT_NODE, userId)

    if (!result) {
        await delay(500)
        result = await getGunData(NFT_AVATAR_GUN_ROOT_NODE, userId)
    }

    return result as any as string
}

export async function setUserAddress(userId: string, address: string) {
    // save userId
    setGunData([NFT_AVATAR_GUN_ROOT_NODE, userId], address)
}

export async function getUserAddresses() {
    // TODO:
    const NFTAvatarKeys = Object.keys([]).filter((x) => x !== '_')
    const resultPromise = NFTAvatarKeys.map((key) => getUserAddress(key))
    const result = (await Promise.all(resultPromise)).filter((x) => x)

    return result as any as string[]
}
