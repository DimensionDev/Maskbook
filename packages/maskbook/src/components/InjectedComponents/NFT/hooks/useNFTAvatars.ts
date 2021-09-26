import { useAsyncRetry } from 'react-use'
import { getNFTAvatars } from '../gun'

export function useNFTAvatars() {
    return useAsyncRetry(async () => {
        const result = await getNFTAvatars()
        return result
    }, [getNFTAvatars])
}
