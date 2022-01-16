import { delay } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { NFT_AVATAR_GUN_SERVER } from '../constants'

async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../network/gun/version.2')
    return { gun2 }
}

// After reinstalling the system, it cannot be retrieved for the first time, so it needs to be taken twice
export async function getUserAddress(userId: string): Promise<string> {
    const NFTAvatarGUN = (await getAvatarGun()).gun2.get(NFT_AVATAR_GUN_SERVER)
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
    try {
        const NFTAvatarGUN = (await getAvatarGun()).gun2.get(NFT_AVATAR_GUN_SERVER)
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
    } catch {
        throw new Error('Something went wrong, and please check your connection.')
    }

    const _address = await getUserAddress(userId)
    if (!isSameAddress(_address, address)) throw new Error('Gun2 is not able to save the address correctly.')
}
