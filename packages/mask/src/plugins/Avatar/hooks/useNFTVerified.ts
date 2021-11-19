import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'

export function useNFTVerified(address: string) {
    return useAsync(async () => {
        const verified = await PluginNFTAvatarRPC.getNFTContractVerifiedFromJSON(address)
        return verified
    }, [address])
}
