import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { MaskBoxRPC } from '../messages'

export function useMaskBoxMetadata(boxId: string, creator: string) {
    return useAsyncRetry(async () => {
        if (!boxId || !creator || !EthereumAddress.isValid(creator)) return
        return MaskBoxRPC.getMaskBoxMetadata(boxId, creator)
    }, [creator])
}
