import { safeUnreachable } from '@masknet/kit'
import { ChainId } from '@masknet/web3-shared-evm'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { getAvatarFromNextID } from './getAvatarFromNextID.js'
import { getAvatar } from './getAvatar.js'
import type { AvatarNextID } from '../types.js'

export async function getPersonaAvatar<T extends NetworkPluginID>(
    siteType: EnhanceableSite,
    userId: string,
    avatarId: string,
    persona?: string,
): Promise<AvatarNextID<T> | null> {
    // only twitter is supported
    if (siteType !== EnhanceableSite.Twitter) return null

    const personaAvatar = await getAvatarFromNextID<T>(EnhanceableSite.Twitter, userId, avatarId, persona)
    if (personaAvatar) return personaAvatar

    const avatar = await getAvatar(EnhanceableSite.Twitter, userId)
    if (!avatar) return null

    if (avatarId !== avatar.avatarId) return null

    const pluginId = avatar.pluginId
    if (!pluginId) return null

    switch (pluginId) {
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
            return null
        default:
            safeUnreachable(pluginId)
            return null
    }
}
