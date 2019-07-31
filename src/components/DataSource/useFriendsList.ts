import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'

export function useFriendsList() {
    return useValueRef(getActivatedUI().friendsRef)
}
