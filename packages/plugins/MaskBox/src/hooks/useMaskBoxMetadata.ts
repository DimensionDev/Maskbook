import { isValidAddress } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { MaskBoxRPC } from '../messages.js'
import { useWeb3State } from '@masknet/web3-hooks-base'

export function useMaskBoxMetadata(boxId: string, creator: string) {
    const { Storage } = useWeb3State()
    return useAsyncRetry(async () => {
        if (!boxId || !creator || !isValidAddress(creator) || !Storage) return
        return MaskBoxRPC.getMaskBoxMetadata(boxId, creator, Storage)
    }, [creator])
}
