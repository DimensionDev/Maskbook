import { Profile } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
import { currentSelectedIdentity } from '../../components/shared-settings/settings'
import { GetContext } from '@holoflows/kit/es'

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
export function useMyPersonas() {
    const personasRef = useValueRef(getActivatedUI().myPersonasRef)
    if (GetContext() === 'options') return personasRef
    return []
}
export function useCurrentIdentity(noDefault?: boolean): Profile | null {
    const all = useMyIdentities()
    const current = useValueRef(currentSelectedIdentity[getActivatedUI().networkIdentifier])
    return all.find(i => i.identifier.toText() === current) || (noDefault ? null : all[0])
}
export function useCurrentGroupsList() {
    const groups = useGroupsList()
    const currentIdentity = useCurrentIdentity()
    if (!currentIdentity) return []
    return groups.filter(x =>
        x.identifier.isVirtual ? x.identifier.ownerIdentifier.equals(currentIdentity.identifier) : false,
    )
}
