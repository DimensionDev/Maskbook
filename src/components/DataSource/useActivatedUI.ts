import { Profile } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import { currentSelectedIdentity } from '../../components/shared-settings/settings'

export function useFriendsList() {
    return useValueRef(getActivatedUI().friendsRef)
}
export function useGroupsList() {
    return useValueRef(getActivatedUI().groupsRef)
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
    return all.find(i => i.identifier.toText() === current) || (noDefault ? null : all[0])
}
