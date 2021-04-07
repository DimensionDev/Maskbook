import type { Profile } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { currentSelectedIdentity } from '../../settings/settings'
import { useMemo } from 'react'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../social-network'
import { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

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
