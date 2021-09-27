import { AvatarMetaDB, NFT_AVATAR_SERVER } from '../types'

const NFTAvatarCache = new Map<string, AvatarMetaDB>()
async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../../network/gun/version.2')
    return { gun2 }
}

async function getNFTAvatar(userId: string) {
    const avatar = NFTAvatarCache.get(userId)
    if (!avatar) {
        NFTAvatarCache.set(
            userId,
            await (
                await getAvatarGun()
            ).gun2
                .get(NFT_AVATAR_SERVER)
                // @ts-expect-error
                .get(userId).then!(),
        )
    }

    return NFTAvatarCache.get(userId)
}

async function setOrClearAvatar(userId: string, avatar?: AvatarMetaDB) {
    await (
        await getAvatarGun()
    ).gun2
        .get(NFT_AVATAR_SERVER)
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(avatar ? avatar : null).then!()
}

async function getNFTAvatars() {
    const NFTAvatarNodes =
        (await (
            await getAvatarGun()
        ).gun2 //@ts-expect-error
            .get(NFT_AVATAR_SERVER).then!()) || []
    console.log(NFTAvatarNodes)

    const NFTAvatarKeys = Object.keys(NFTAvatarNodes).filter((x) => x !== '_')
    const resultPromise = NFTAvatarKeys.map((key) => getNFTAvatar(key))
    const result = (await Promise.all(resultPromise)).filter((x) => x) as AvatarMetaDB[]
    return result
}

async function saveNFTAvatar(userId: string, avatarId: string, address: string, tokenId: string) {
    const avatarMeta: AvatarMetaDB = {
        userId,
        address,
        tokenId,
        avatarId,
    }

    await setOrClearAvatar(userId)

    await setOrClearAvatar(userId, avatarMeta)
    return avatarMeta
}
