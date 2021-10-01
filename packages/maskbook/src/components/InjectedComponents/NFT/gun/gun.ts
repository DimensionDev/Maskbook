import { NFT_AVATAR_GUN_SERVER } from '../types'

const cache = new Map<string, string>()
async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../../network/gun/version.2')
    return { gun2 }
}

export async function getUserAddress(userId: string) {
    const result = await (
        await getAvatarGun()
    ).gun2
        .get(NFT_AVATAR_GUN_SERVER)
        //@ts-expect-error
        .get(userId).then!()
    return result
}

export async function setUserAddress(userId: string, address: string) {
    await (
        await getAvatarGun()
    ).gun2
        .get(NFT_AVATAR_GUN_SERVER)
        //@ts-expect-error
        .get(userId)
        //@ts-expect-error
        .put(null).then!()

    await (
        await getAvatarGun()
    ).gun2
        .get(NFT_AVATAR_GUN_SERVER)
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(address).then!()
}
