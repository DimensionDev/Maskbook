import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier, useValueRef } from '@masknet/shared'
import { useMemo } from 'react'
import type { Profile } from '../../database'
import { currentSelectedIdentity } from '../../settings/settings'
import type { SocialNetworkUI } from '../../social-network'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'

export function useFriendsList() {
    const ref = useValueRef(globalUIState.friends)
    return useMemo(() => [...ref.values()], [ref])
}

const default_ = new ValueRef({ identifier: ProfileIdentifier.unknown })
export function useLastRecognizedIdentity() {
    return useValueRef<SocialNetworkUI.CollectingCapabilities.IdentityResolved>(
        activatedSocialNetworkUI.collecting.identityProvider?.lastRecognized || default_,
    )
}
export function useMyIdentities() {
    return useValueRef(globalUIState.profiles)
}
export function useCurrentIdentity(noDefault?: boolean): Profile | null {
    const all = useMyIdentities()
    const current = useValueRef(currentSelectedIdentity[activatedSocialNetworkUI.networkIdentifier])
    return all.find((i) => i.identifier.toText() === current) || (noDefault ? null : all[0])
}
