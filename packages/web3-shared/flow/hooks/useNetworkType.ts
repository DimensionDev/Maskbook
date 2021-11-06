import { useCurrentUser } from '.'
import { NetworkType } from '../types'

export function useNetworkType() {
    const currentUser = useCurrentUser()
    return currentUser ? NetworkType.Flow : null
}
