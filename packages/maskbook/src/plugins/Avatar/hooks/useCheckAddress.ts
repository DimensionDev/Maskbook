import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTAvatarFromJSON } from '../Services/db'

const cache = new Map<string, Promise<string | undefined>>()
export function useCheckAddress(userId: string, owner: string) {
    return useAsync(async () => {
        if (!userId) return false
        let f = cache.get(userId)
        if (!f) {
            f = PluginNFTAvatarRPC.getAddress(userId)
            cache.set(userId, f)
        }
        const address = await f
        if (!address) {
            const avatar = await getNFTAvatarFromJSON(userId)
            return !!avatar
        }
        return address === owner
    }).value
}
