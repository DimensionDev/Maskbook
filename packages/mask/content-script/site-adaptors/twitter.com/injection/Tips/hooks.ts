import { useQuery } from '@tanstack/react-query'
import { getUserIdentity } from '../../utils/user.js'

export function useUserIdentity(userId: string) {
    const { data: identity } = useQuery({
        queryKey: ['get-user-identity', userId],
        queryFn: () => getUserIdentity(userId).then((x) => x || null),
    })
    return identity
}
