import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import type { AvatarMetaDB } from '../types'

const NFTAvatarCache = new Map<string, AvatarMetaDB>()
async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../../network/gun/version.2')
    return { gun2 }
}

export async function getNFTAvatar(userId: string) {
    const avatar = NFTAvatarCache.get(userId)
    if (!avatar) {
        NFTAvatarCache.set(
            userId,
            await (
                await getAvatarGun()
            ).gun2
                .get('com.maskbook.nft.avatar')
                // @ts-expect-error
                .get(userId).then!(),
        )
    }

    return NFTAvatarCache.get(userId)
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
    return result
}

export async function saveNFTAvatar(userId: string, avatarId: string, token: ERC721TokenDetailed) {
    const avatarMeta: AvatarMetaDB = {
        name: token.info.name,
        symbol: token.contractDetailed.symbol ?? 'ETH',
        image: token.info.image ?? '',
        userId,
        address: token.contractDetailed.address,
        tokenId: token.tokenId,
        avatarId,
        amount: '0',
    }

    await setOrClearAvatar(userId)

    await setOrClearAvatar(userId, avatarMeta)
    return avatarMeta
}
