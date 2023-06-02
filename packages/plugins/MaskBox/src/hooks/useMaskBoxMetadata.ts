import { useAsyncRetry } from 'react-use'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { MaskBoxRPC } from '../messages.js'

export function useMaskBoxMetadata(boxId: string, creator: string) {
    return useAsyncRetry(async () => {
        if (!boxId || !creator || !isValidAddress(creator)) return
        return MaskBoxRPC.getMaskBoxMetadata(boxId, creator)
    }, [creator])
}
