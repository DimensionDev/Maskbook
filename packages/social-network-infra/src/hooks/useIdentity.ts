import { useAsyncRetry } from 'react-use'
import { useSocialNetwork } from './useContext.js'

export function useIdentity(userId?: string) {
    const socialNetwork = useSocialNetwork()
    
    return useAsyncRetry(async () => {
        if (!userId) return
        return socialNetwork.utils.getIdentity?.(userId)
    }, [userId, socialNetwork])
}
