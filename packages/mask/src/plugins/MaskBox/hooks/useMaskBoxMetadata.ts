import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import type { BoxMetadata } from '../type.js'

export function useMaskBoxMetadata(boxId: string, creator: string) {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!boxId || !creator || !isValidAddress(creator) || !Storage) return
        const storage = Storage.createRSS3Storage(creator)
        const boxes = await storage?.get<Record<string, BoxMetadata>>(creator)
        return boxes?.[boxId]
    }, [creator, boxId, Storage])
}
