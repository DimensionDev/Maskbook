import { first } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { RSS3_KEY_SITE } from '../constants.js'
import { useGetNFTAvatar } from './useGetNFTAvatar.js'
import { EnhanceableSite, type NextIDPersonaBindings, NextIDPlatform, getSiteType } from '@masknet/shared-base'
import { NextIDProof, NextIDStorageProvider } from '@masknet/web3-providers'
import type { NextIDAvatarMeta } from '../types.js'
import { PLUGIN_ID } from '../constants.js'

async function getAvatarFromNextIDStorage(
    persona: string,
    platform: NextIDPlatform,
    userId: string,
    avatarId?: string,
) {
    const response = await NextIDStorageProvider.getByIdentity<NextIDAvatarMeta>(
        persona,
        platform,
        userId.toLowerCase(),
        PLUGIN_ID,
    )
    if (!response.isOk()) return

    if (!avatarId || response.value?.avatarId === avatarId) return response.value
    return
}

function sortPersonaBindings(a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId?: string): number {
    if (!userId) return 0

    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.last_checked_at > p_b.last_checked_at) return -1
    return 1
}

async function getNFTAvatarByUserId(
    userId: string,
    avatarId: string,
    persona: string,
): Promise<NextIDAvatarMeta | undefined> {
    const platform = getSiteType() === EnhanceableSite.Twitter ? NextIDPlatform.Twitter : undefined
    if (!platform) return

    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)

    if (persona) {
        const binding = bindings.filter((x) => x.persona.toLowerCase() === persona.toLowerCase())?.[0]
        if (binding) return getAvatarFromNextIDStorage(binding.persona, platform, userId, avatarId)
    }
    for (const binding of bindings.sort((a, b) => sortPersonaBindings(a, b, userId))) {
        const avatar = await getAvatarFromNextIDStorage(binding.persona, platform, userId, avatarId)
        if (avatar) return avatar
    }
    return
}

export function usePersonaNFTAvatar(userId: string, avatarId: string, persona: string, siteKey: RSS3_KEY_SITE) {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsyncRetry(async () => {
        if (!userId) return

        const siteType = getEnhanceableSiteType()
        if (!siteType) return

        const avatarMetaFromPersona = await getNFTAvatarByUserId(userId, avatarId, persona)
        if (avatarMetaFromPersona) return avatarMetaFromPersona

        const avatarMeta = await getNFTAvatar(userId, siteType, siteKey)
        if (!avatarMeta) return

        if (avatarId && avatarId !== avatarMeta.avatarId) return

        if (avatarMeta.pluginId === NetworkPluginID.PLUGIN_SOLANA)
            return { imageUrl: '', nickname: '', ...avatarMeta, address: avatarMeta.tokenId }

        return {
            imageUrl: '',
            nickname: '',
            pluginId: NetworkPluginID.PLUGIN_EVM,
            chainId: ChainId.Mainnet,
            ...avatarMeta,
        }
    }, [avatarId, userId, persona, siteKey, getNFTAvatar])
}
