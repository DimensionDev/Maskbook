import type { Profile } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import { currentSelectedIdentity } from '../../settings/settings'
import { useMemo } from 'react'

export function useFriendsList() {
    const ref = useValueRef(getActivatedUI().friendsRef)
    return useMemo(() => [...ref.values()], [ref])
}
export function useLastRecognizedIdentity() {
    return useValueRef(getActivatedUI().lastRecognizedIdentity)
}
export function useMyIdentities() {
    return useValueRef(getActivatedUI().myIdentitiesRef)
}
export function useCurrentIdentity(noDefault?: boolean): Profile | null {
    const all = useMyIdentities()
    const current = useValueRef(currentSelectedIdentity[getActivatedUI().networkIdentifier])
    return all.find((i) => i.identifier.toText() === current) || (noDefault ? null : all[0])
}
