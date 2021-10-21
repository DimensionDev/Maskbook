import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { isSameAddress, safeNonPayableTransactionCall } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTAvatarFromJSON } from '../Services/db'

export function useCheckAddress(userId: string, tokenId: string, erc721Contract: ERC721 | null) {
    return useAsync(async () => {
        if (!userId || !tokenId || !erc721Contract) return false
        const owner = await safeNonPayableTransactionCall(erc721Contract.methods.ownerOf(tokenId))
        const address = await PluginNFTAvatarRPC.getAddress(userId)
        if (!address) {
            const avatar = await getNFTAvatarFromJSON(userId)
            return !!avatar
        }

        return isSameAddress(address, owner)
    }, [userId, erc721Contract]).value
}
