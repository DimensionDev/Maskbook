import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'
import type { NFTVerified } from '../types'

export function useNFTVerified(address: string): AsyncState<NFTVerified> {
    return useAsync(async () => {
        const verified = await PluginNFTAvatarRPC.getNFTContractVerifiedFromJSON(address)
        return verified
    }, [address])
}
