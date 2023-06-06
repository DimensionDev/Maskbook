import { SnapshotSearch } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useSnapshotSpacesByTwitterHandler(twitterHandler: string) {
    return useAsyncRetry(async () => {
        if (!twitterHandler) return
        const spaceList = await SnapshotSearch.get()
        return spaceList.filter((x) => x.twitterHandler.toLowerCase() === twitterHandler.toLowerCase())
    }, [twitterHandler])
}
