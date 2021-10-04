import { gun2 } from '../../../network/gun/version.2'
import { NFT_AVATAR_GUN_SERVER } from '../constants'

export async function getUserAddress(userId: string) {
    const result = await gun2
        .get(NFT_AVATAR_GUN_SERVER)
        //@ts-expect-error
        .get(userId).then!()
    return result
}

export async function setUserAddress(userId: string, address: string) {
    // delete userId
    await gun2
        .get(NFT_AVATAR_GUN_SERVER)
        //@ts-expect-error
        .get(userId)
        //@ts-expect-error
        .put(null).then!()

    // save userId
    await gun2
        .get(NFT_AVATAR_GUN_SERVER)
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(address).then!()
}
