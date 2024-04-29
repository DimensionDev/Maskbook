import { first } from 'lodash-es'
import {
    EnhanceableSite,
    NextIDPlatform,
    PluginID,
    type NetworkPluginID,
    type NextIDPersonaBindings,
} from '@masknet/shared-base'
import { NextIDProof, NextIDStorageProvider } from '@masknet/web3-providers'
import type { AvatarNextID } from '../types.js'

async function getAvatarFromNextIDStorage<T extends NetworkPluginID>(
    platform: NextIDPlatform,
    userId: string,
    avatarId: string,
    persona: string,
) {
    const response = await NextIDStorageProvider.getByIdentity<AvatarNextID<T>>(
        persona,
        platform,
        userId.toLowerCase(),
        PluginID.Avatar,
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

export async function getAvatarFromNextID<T extends NetworkPluginID>(
    siteType: EnhanceableSite,
    userId: string,
    avatarId: string,
    persona?: string,
): Promise<AvatarNextID<T> | undefined> {
    const platform = siteType === EnhanceableSite.Twitter ? NextIDPlatform.Twitter : undefined
    if (!platform) return

    const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)

    if (persona) {
        const binding = bindings.find((x) => x.persona.toLowerCase() === persona.toLowerCase())
        if (binding) return getAvatarFromNextIDStorage<T>(platform, userId, avatarId, binding.persona)
    }
    for (const binding of bindings.sort((a, b) => sortPersonaBindings(a, b, userId))) {
        const avatar = await getAvatarFromNextIDStorage<T>(platform, userId, avatarId, binding.persona)
        if (avatar) return avatar
    }
    return
}
