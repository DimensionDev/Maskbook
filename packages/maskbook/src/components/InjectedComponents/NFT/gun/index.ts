import { getNFTAvatarFromJSON } from './db'
import { getNFTAvatarFromGun, saveNFTAvatarGun } from './gun'

export async function getNFTAvatar(userId: string) {
    let avatar = await getNFTAvatarFromGun(userId)
    if (avatar) return avatar

    avatar = await getNFTAvatarFromJSON(userId)
    return avatar
}

export async function saveNFTAvatar(userId: string, avatarId: string, address: string, tokenId: string) {
    const avatar = await saveNFTAvatarGun(userId, avatarId, address, tokenId)
    return avatar
}
