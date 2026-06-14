import { useMemo } from 'react'
import { type ECKeyIdentifier, EMPTY_LIST } from '@masknet/shared-base'
import { useCurrentLinkedPersona } from '@masknet/shared'
import type { Friend } from './useFriends.js'
import type { FriendNetwork } from '../pages/Friends/common.js'

export type NextIDPersonaBindingsWithIdentifier = {
    proofs: Array<{
        platform: FriendNetwork
        identity: string
        is_valid: boolean
        last_checked_at: string
        name: string
        created_at: string
    }>
    linkedPersona: ECKeyIdentifier
    activated_at: string
    persona: string
    isLocal?: boolean
    avatar?: string
}

export function useFriendsFromSearch(localSearchedResult: Friend[]): NextIDPersonaBindingsWithIdentifier[] {
    const currentIdentifier = useCurrentLinkedPersona()
    return useMemo(() => {
        if (!localSearchedResult?.length) return EMPTY_LIST
        return localSearchedResult
            .filter((x) => x.persona.publicKeyAsHex !== currentIdentifier?.identifier.publicKeyAsHex && x.profile)
            .map((item) => {
                const profile = item.profile!
                return {
                    proofs: [
                        {
                            platform: profile.network as FriendNetwork,
                            identity: profile.userId,
                            is_valid: true,
                            last_checked_at: '',
                            name: profile.userId,
                            created_at: '',
                        },
                    ],
                    linkedPersona: item.persona,
                    activated_at: '',
                    persona: item.persona.publicKeyAsHex,
                    isLocal: true,
                    avatar: item.avatar,
                }
            })
    }, [localSearchedResult, currentIdentifier])
}
