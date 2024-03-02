import { EnhanceableSite, getEnhanceableSiteType, NetworkPluginID } from '@masknet/shared-base'
import { getAvatarFromNextID } from './getAvatarFromNextID.js'
import { getAvatar } from './getAvatar.js'
import { ChainId } from '@masknet/web3-shared-evm'
import type { AvatarNextID } from '../types.js'

export async function getPersonaAvatar<T extends NetworkPluginID>(
    userId: string,
    avatarId: string,
    persona: string,
): Promise<AvatarNextID<T> | undefined> {
    const siteType = getEnhanceableSiteType()

    // only twitter is supported
    if (siteType !== EnhanceableSite.Twitter) return

    const personaAvatar = await getAvatarFromNextID<T>(userId, avatarId, persona)
    if (personaAvatar) return personaAvatar

    const avatar = await getAvatar(userId)
    if (!avatar) return

    if (avatarId !== avatar.avatarId) return

    switch (avatar.pluginId) {
        case NetworkPluginID.PLUGIN_EVM:
            return {
                pluginId: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
                imageUrl: '',
                nickname: '',
                ...avatar,
            } as AvatarNextID<T>
        case NetworkPluginID.PLUGIN_SOLANA:
            return {
                pluginId: NetworkPluginID.PLUGIN_SOLANA,
                imageUrl: '',
                nickname: '',
                ...avatar,
                address: avatar.tokenId,
            } as AvatarNextID<T>
        case NetworkPluginID.PLUGIN_FLOW:
            return
        default:
            return
    }
}
