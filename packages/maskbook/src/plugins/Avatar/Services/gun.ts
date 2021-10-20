import { delay } from '@masknet/shared'
import { gun2 } from '../../../network/gun/version.2'
import { NFT_AVATAR_GUN_SERVER } from '../constants'

const NFTAvatarGUN = gun2.get(NFT_AVATAR_GUN_SERVER)

// After reinstalling the system, it cannot be retrieved for the first time, so it needs to be taken twice
export async function getUserAddress(userId: string) {
    let result = await NFTAvatarGUN
        //@ts-expect-error
        .get(userId).then!()

    if (!result) {
        await delay(500)
        result = await NFTAvatarGUN
            //@ts-expect-error
            .get(userId).then!()
    }

    return result
}

export async function setUserAddress(userId: string, address: string) {
    // delete userId
    await NFTAvatarGUN
        //@ts-expect-error
        .get(userId)
        //@ts-expect-error
        .put(null).then!()

    // save userId
    await NFTAvatarGUN
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(address).then!()
}
