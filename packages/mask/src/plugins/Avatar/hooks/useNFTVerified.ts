import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'
import type { NFTVerified } from '../types'

export function useNFTVerified(address: string): AsyncState<NFTVerified> {
    return useAsync(async () => {
        if (!address) return
        return PluginNFTAvatarRPC.getNFTContractVerifiedFromJSON(address)
    }, [address])
}
