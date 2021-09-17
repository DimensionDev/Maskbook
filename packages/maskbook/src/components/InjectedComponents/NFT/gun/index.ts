import type { AvatarMetaDB } from '../types'
import { getNFT } from '../utils'

const NFTAvatarCache = new Map<string, AvatarMetaDB>()
async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../../network/gun/version.2')
    return { gun2 }
}

export async function getNFTAvatar(userId: string) {
    if (NFTAvatarCache.has(userId)) return NFTAvatarCache.get(userId)
    const avatarDB = await (
        await getAvatarGun()
    ).gun2
        .get('com.maskbook.nft.avatar')
        // @ts-expect-error
        .get(userId).then!()

    NFTAvatarCache.set(userId, avatarDB)
    return avatarDB as AvatarMetaDB
}

export async function setOrClearAvatar(userId: string, avatar?: AvatarMetaDB) {
    await (
        await getAvatarGun()
    ).gun2
        .get('com.maskbook.nft.avatar')
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(avatar ? avatar : null).then!()
}

export async function getNFTAvatars() {
    const NFTAvatarNodes =
        (await (
            await getAvatarGun()
        ).gun2 //@ts-expect-error
            .get('com.maskbook.nft.avatar').then!()) || []
    const NFTAvatarKeys = Object.keys(NFTAvatarNodes).filter((x) => x !== '_')
    const resultPromise = NFTAvatarKeys.map((key) => getNFTAvatar(key))
    const result = (await Promise.all(resultPromise)).filter((x) => x) as AvatarMetaDB[]
    console.log(result)
    return result
}

export async function saveNFTAvatar(userId: string, avatarId: string, address: string, tokenId: string) {
    const { name, symbol, amount, image } = await getNFT(address, tokenId)
    const avatarMeta: AvatarMetaDB = {
        name,
        amount,
        symbol,
        image,
        userId,
        address,
        tokenId,
        avatarId,
    }

    await setOrClearAvatar(userId)

    await setOrClearAvatar(userId, avatarMeta)
    return avatarMeta
}
