import { delay } from '@masknet/shared'
import { gun2 } from '../../../network/gun/version.2'
import { NFT_AVATAR_GUN_SERVER } from '../constants'

const NFTAavatarGUN = gun2.get(NFT_AVATAR_GUN_SERVER)
export async function getUserAddress(userId: string) {
    let result = await NFTAavatarGUN
        //@ts-expect-error
        .get(userId).then!()

    if (!result) {
        await delay(500)
        result = await NFTAavatarGUN
            //@ts-expect-error
            .get(userId).then!()
    }

    return result
}

export async function setUserAddress(userId: string, address: string) {
    // delete userId
    await NFTAavatarGUN
        //@ts-expect-error
        .get(userId)
        //@ts-expect-error
        .put(null).then!()

    // save userId
    await NFTAavatarGUN
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(address).then!()
}
